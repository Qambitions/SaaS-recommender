import datetime
import functools
import logging
import os
import pathlib
import time
from functools import partial
from logging import FileHandler
from pathlib import Path

from dateutil.relativedelta import MO, relativedelta
from tqdm import tqdm
import pandas as pd

from recommender import settings
config = settings

tqdm0 = partial(tqdm, position=0, desc="level 1", leave=True, colour='green', ncols=60)
tqdm1 = partial(tqdm, position=1, desc="level 2", leave=True,  colour='red',  ncols=60)

################################################################################
################################################################################
##    ####   #####   ####   ###   ####     #    #####   ###   ####    ###     ##
##    #   #  #      #      #   #  #   #   # #     #    #   #  #   #  #        ##
##    #   #  #####  #      #   #  ####   #####    #    #   #  ####    ###     ##
##    #   #  #      #      #   #  # #    #   #    #    #   #  # #        #    ##
##    ####   #####   ####   ###   #  ##  #   #    #     ###   #  ##   ###     ##
################################################################################
################################################################################


def timing(func=None, *, activate=True, return_time=False, factor=1000,
           split_before=False, split_after=False, times=1):
    def decor_timing(func):
        time_run = 0
        @functools.wraps(func)
        def wrap_func(*args,**kwargs):
            nonlocal time_run

            time1 = time.time()
            for _ in range(times):
                ret = func(*args,**kwargs)
            time2 = time.time()
            run_time = time2 - time1

            if split_before:
                print(f"{' '+str(time_run)+' ':#^54}")
                time_run +=1

            ti = '' if times==1 else f"x{times} "
            print('Runtime of {}{:<30s}{:>10_.5f} ms'.format(ti,
                func.__name__, run_time*factor))

            if split_after:
                print(f"{' '+str(time_run)+' ':#^54}")
                time_run +=1

            if return_time:
                return run_time*factor
            else:
                return ret
        if activate:
            return wrap_func
        else:
            return func

    if func is None:
        return decor_timing
    else:
        return decor_timing(func)


def reduce_query(file_path=None, always_query=False, verbose=False,
                 out_of_date_rule='date', *, func=None):
    """A decorator to reduce the number of query by store in file and in memory if they are up-to-date
    Args:
        - file_path: str
            path to store temporary file
        - always_query: bool
            if true, ignore all other stuff and always execute the query
    NOTE: The decorated function must return a pandas.DataFrame

    Example 1:
    >>> @reduce_query('cache.pkl')
    >>> def query_sth():
    >>>     return df
    >>> query_sth()

    Example 2:
    >>> def query_sth():
    >>>     return df
    >>> query_reduced = reduce_query(func=query_sth, file_path='cache.pkl')
    >>> query_reduced()
    """
    def inner(func):
        df    = None
        df_dt = None

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            nonlocal df
            nonlocal df_dt
            nonlocal file_path
            nonlocal always_query
            nonlocal out_of_date_rule
            nonlocal verbose

            if always_query:
                return func(*args, **kwargs)

            if verbose:
                print(func.__name__)

            now = datetime.datetime.now()

            try:
                file_dt = os.path.getmtime(file_path)
                file_dt = datetime.datetime.fromtimestamp(file_dt)
            except FileNotFoundError:
                if verbose: print(f"File '{file_path}' not found")
                file_dt = None

            if out_of_date_rule == 'date':
                is_mem_up_to_date  = df_dt   is not None and df_dt.date()   == now.date()
                is_file_up_to_date = file_dt is not None and file_dt.date() == now.date()
            else:
                # TODO: add 5m, 1h, 1d, 1M here
                raise NotImplementedError()

            if is_mem_up_to_date:
                if verbose:
                    print('Return from memory')
                if not is_file_up_to_date:
                    if verbose: print('Update file')
                    df.to_pickle(file_path)
            elif is_file_up_to_date:
                if verbose:
                    print('Return from file')
                df = pd.read_pickle(file_path)
                df_dt = file_dt
            else:
                if verbose:
                    print('Return from query')
                df = func(*args, **kwargs)
                if isinstance(df, tuple):
                    df = df[0]
                df.to_pickle(file_path)
                df_dt = now
            return df
        return wrapper
    return inner if func is None else inner(func)
