from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from datetime import date, datetime, timedelta
from django.db.models import Q
from django.db import connections
from django.db.utils import OperationalError
from django.utils import timezone
from django.http import JsonResponse
from pathlib import Path
from .serializers import *
from .models import *
from .utils import check_allow_fields,add_df_model_with_some_fields,add_more_information_for_product_id

from .personalize_recommendation import predict_product_colab,train_model_colab,predict_model_hot,predict_model_demographic,train_model_demographic,train_model_hot,predict_model_contentbase,train_model_contentbase
from .recommend_statistic import login_statistic, session_event_management
from recommender import settings

import pandas as pd
import random
import json
import os
import json
import re
import string
import random
import csv


def id_generator(size=7, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

# Read configure file
base_dir = Path(__file__).resolve().parent.parent
module_dir = os.path.dirname(__file__)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_report(request):
    try:
        time_range        = request.GET['time']
        username          = request.GET['username']
        event_type        = request.GET['event_type']
    
        enddate = datetime.today()
        if time_range == 'week':
            startdate = enddate - timedelta(days=6)
        elif time_range == 'month':
            startdate = enddate - timedelta(days=30)
        elif time_range == 'year':
            startdate = enddate - timedelta(days=365)
        else:
            return Response({'message': "thiếu dữ liệu"})
        # print(startdate,enddate)
        df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
        if df_manageClient.shape[0] == 0:
            return Response({"Chưa có đăng ký"})
        DB_client = df_manageClient.iloc[0]['database_name']
        
        session   = Session.objects.using(DB_client).values()
        webevent  = WebEvent.objects.using(DB_client).\
                                filter(Q(event_type = event_type) if event_type!="" else Q()).\
                                filter(created_at__range = [startdate, enddate]).values()
        itemevent = EventItem.objects.using(DB_client).values()
        if (not  session) or (not webevent) or (not itemevent):
            return Response({'message':"false"})
        session   = pd.DataFrame(session)      
        webevent  = pd.DataFrame(webevent)
        itemevent = pd.DataFrame(itemevent)

        webevent.session_id = webevent.session_id.astype('int64')
        itemevent.event_id = itemevent.event_id.astype('int64')
        itemevent.product_id = itemevent.product_id.astype('int64')
        df = session.merge(webevent,how='inner', on = 'session_id')
        df = df.merge(itemevent,how='inner', on = 'event_id')
        
        groupby_object = df.groupby(by=['product_id'])
        result   = groupby_object.size().reset_index(name='counts')
        product = pd.DataFrame(Product.objects.using(DB_client).values())
        product.product_id = product.product_id.astype('int64')
        result = result.merge(product,on='product_id')
        return Response({'message': result[["product_id","counts","product_name","category","price","url","image"]]})
    except Exception as exception:
        return Response({'message': exception})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_diagram_data(request):
    username          = request.GET['username']
    enddate = timezone.now().date()
    startdate = enddate - timedelta(days=366)
    
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
    if df_manageClient.shape[0] == 0:
        return Response({'message':"false"})
    DB_client = df_manageClient.iloc[0]['database_name']
    session   = Session.objects.using(DB_client).values()
    webevent  = WebEvent.objects.using(DB_client).\
                                filter(created_at__range = [startdate.strftime('%Y-%m-%d %H:%M:%S')+'+00:00', enddate.strftime('%Y-%m-%d %H:%M:%S')+'+00:00']).values()
    itemevent = EventItem.objects.using(DB_client).values()
    if (not  session) or (not webevent) or (not itemevent):
            return Response({'message':"false"})
    session   = pd.DataFrame(session)      
    webevent  = pd.DataFrame(webevent)
    itemevent = pd.DataFrame(itemevent)

    webevent.session_id = webevent.session_id.astype('int64')
    itemevent.event_id = itemevent.event_id.astype('int64')
    itemevent.product_id = itemevent.product_id.astype('int64')
    df = session.merge(webevent,how='inner', on = 'session_id')
    df = df.merge(itemevent,how='inner', on = 'event_id')
    groupby_object = df.groupby(['event_type', pd.Grouper(key = "created_at",freq="1D")])
    result   = groupby_object.size().reset_index(name='counts')

    result_click = result[result["event_type"] == "Click"][["created_at","counts"]].copy()
    result_atc = result[result["event_type"] == "Add to cart"][["created_at","counts"]].copy()
    result_rfc = result[result["event_type"] == "Remove from cart"][["created_at","counts"]].copy()
    result_view = result[result["event_type"] == "View"][["created_at","counts"]].copy()
    result_login = result[result["event_type"] == "Login"][["created_at","counts"]].copy()

    idx = pd.date_range(pd.to_datetime(startdate.strftime('%Y-%m-%d %H:%M:%S')+'+00:00'), pd.to_datetime(enddate.strftime('%Y-%m-%d %H:%M:%S')+'+00:00'))
    full_result_click  =  result_click.set_index('created_at').reindex(idx,fill_value=0).rename_axis('created_at').reset_index()
    full_result_atc    =  result_atc.set_index('created_at').reindex(idx,fill_value=0).rename_axis('created_at').reset_index()
    full_result_rfc    =  result_rfc.set_index('created_at').reindex(idx,fill_value=0).rename_axis('created_at').reset_index()
    full_result_view   =  result_view.set_index('created_at').reindex(idx,fill_value=0).rename_axis('created_at').reset_index()
    full_result_login  =  result_login.set_index('created_at').reindex(idx,fill_value=0).rename_axis('created_at').reset_index()
   
    full_result_click.created_at = full_result_click.created_at.dt.strftime('%Y-%m-%d')
    return Response({'message':{'Click':full_result_click,
                                'Add to cart':full_result_atc,
                                'Remove from cart':full_result_rfc,
                                'View':full_result_view,
                                'Login':full_result_login} })


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_list_hot_items(request):
    username          = request.GET['username']
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
    if df_manageClient.shape[0] == 0:
        return Response({"Chưa có đăng ký"})
    DB_client = df_manageClient.iloc[0]['database_name']
    web_event  =  pd.DataFrame(WebEvent.objects.using(DB_client).exclude(event_type = "Remove from cart").values())
    event_item =  pd.DataFrame(EventItem.objects.using(DB_client).all().values())
    
    if web_event.shape[0] == 0 or event_item.shape[0] == 0:
        return Response({'message':"false"})

    event_item.event_id = event_item.event_id.astype('int64')
    df = web_event.merge(event_item,how="left", on = 'event_id')
    groupby_object = df.groupby(by=['product_id'], as_index=True, sort=False)
    # print(result[:top_n])
    result   = groupby_object.size().reset_index(name='counts')
    result   = result.sort_values(by=['counts'],ascending=False)
    list_product = result[:10]['product_id']
    info = add_more_information_for_product_id(list_product,DB_client)
    return Response({'message': info})



@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_key_metrics(request):
    time_range        = request.GET['time']
    username          = request.GET['username']
    enddate = datetime.today()
    if time_range == 'week':
        startdate = enddate - timedelta(days=6)
    elif time_range == 'month':
        startdate = enddate - timedelta(days=30)
    elif time_range == 'year':
        startdate = enddate - timedelta(days=365)
    else:
        return Response({'message': "thiếu dữ liệu"})
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
    if df_manageClient.shape[0] == 0:
        return Response({"Chưa có đăng ký"})
    DB_client = df_manageClient.iloc[0]['database_name']
    webevent  = WebEvent.objects.using(DB_client).\
                                filter(created_at__range = [startdate.strftime('%Y-%m-%d %H:%M:%S')+'+00:00', enddate.strftime('%Y-%m-%d %H:%M:%S')+'+00:00']).values()
    itemevent = EventItem.objects.using(DB_client).values()
    if (not itemevent) or (not webevent):
            return Response({'message':"false"})
    webevent  = pd.DataFrame(webevent)
    itemevent = pd.DataFrame(itemevent)

    itemevent.event_id = itemevent.event_id.astype('int64')
    itemevent.product_id = itemevent.product_id.astype('int64')
    df = webevent.merge(itemevent,how='inner', on = 'event_id')
    groupby_object = df.groupby(by=['event_type'])
    result   = groupby_object.size().reset_index(name='counts')
    return Response({'message': result})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def import_csv(request):
    try:
        if request.method == 'POST':
            file = request.FILES['file']
            table = request.POST['table']
            username = request.POST['username']

            file_data = file.read().decode("utf-8-sig",errors="ignore").split("\n")
            reader = csv.reader(file_data)
            df = pd.DataFrame(reader)
            df.columns = df.iloc[0]
            df = df[1:]
            df.dropna(axis = 0, how = 'all', inplace = True)

            df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
            DB_client = df_manageClient.iloc[0]['database_name']
            if df_manageClient.shape[0] == 0:
                return Response({"Chưa có đăng ký"})

            if table.upper() == 'CUSTOMER':
                right_fields,df = check_allow_fields(df,Customer)
                if right_fields==False: return JsonResponse({'message':"import Fail"})
                add_df_model_with_some_fields(df,Customer,DB_client,right_fields)
            elif table.upper() == 'CUSTOMERPROFILE':
                right_fields,df  = check_allow_fields(df,CustomerProfile)
                if right_fields==False: return JsonResponse({'message':"import Fail"})
                add_df_model_with_some_fields(df,CustomerProfile,DB_client,right_fields)
                train_model_demographic(DB_client)
            elif table.upper() == 'PRODUCT':
                right_fields,df  = check_allow_fields(df,Product)
                if right_fields==False: return JsonResponse({'message':"import Fail"})
                add_df_model_with_some_fields(df,Product,DB_client,right_fields)
                train_model_contentbase(DB_client)
            else:
                return JsonResponse({'message':"thiếu trường thông tin"})
            return JsonResponse({'message':"DONE"})
            
    except Exception as e :
        print(e)
        return JsonResponse({'error': 'Invalid request'})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def add_recommender_strategy(request):
    body_json = json.loads(request.body)
    username = body_json['username']
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
    if df_manageClient.shape[0] == 0:
        return Response({"Chưa có đăng ký"})
    DB_client = df_manageClient.iloc[0]['database_name']
    list_append = []
    for i in body_json['strategies']:
        RecommenderStrategy.objects.using(DB_client).update_or_create(event_type=i['event_type'], 
                                                                    url = i['url'],
                                                                    xpath = i['xpath'],
                                                                    defaults={'strategy':i['strategy']})
    return Response({"Done"})


def check_path(x, click_path_send):
    if len(x) > len(click_path_send): 
        return False
    for i in range(len(x)):
        if click_path_send[i] != x[i]:
            return False
    return True

def check_url_regex(url_pattern, current_page):
    pattern = url_pattern
    pattern = pattern.replace("{number}","[0-9]*")
    pattern = pattern.replace("{string}","[\s\S]*")
    pattern = pattern.replace("/","\/")
    pattern += "\/END"
    current_page += "/END"
    regex = re.compile(pattern)
    return regex.match(current_page)

def check_url(x, current_page):
    check = check_url_regex(x,current_page)
    if check: return True
    else: return False

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def allocate_database(request):
    body_json       = json.loads(request.body)
    username        = body_json['username']
    service         = body_json['service']
    # database_name   = body_json['database_name']
    token           = body_json['ip_address']
    list_used = list(ManageAccount.objects.values_list('database_name',flat=True))
    
    for database_name in settings.DATABASES:
        if database_name == 'default' or database_name in list_used: continue
        db_conn = connections[database_name]
        try:
            c = db_conn.cursor()
        except OperationalError:
            connected = False
        else:
            connected = True
        if connected:
            x = ManageAccount(username = username,created_at=timezone.now(), service = service, token = token, database_name=database_name)
            x.save()
            return Response({"DONE"})
    return Response({"Đã hết database để cung cấp"})

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def check_allocate_database(request):
    list_used = list(ManageAccount.objects.values_list('database_name',flat=True))
    
    for database_name in settings.DATABASES:
        if database_name == 'default' or database_name in list_used: continue
        db_conn = connections[database_name]
        try:
            c = db_conn.cursor()
        except OperationalError:
            connected = False
        else:
            connected = True
        if connected:
            return Response({"message":"available"})
    return Response({"Đã hết database để cung cấp"})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def add_scheduler(request):
    body_json = json.loads(request.body)
    username = body_json['username']
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(username=username).values())
    if df_manageClient.shape[0] == 0:
        return Response({"Chưa có đăng ký"})
    DB_client = df_manageClient.iloc[0]['database_name']
    body_json = json.loads(request.body)
    list_append = []
    for i in body_json['scheduler']:
        Scheduler.objects.update_or_create(strategy = i['strategy'],
                                            database_name = DB_client,
                                            defaults={'cycle_time':i['cycle_time']})
    
    return Response({"Done"})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def get_capture(request):
    ip_add = ""
    try:
        body_json = json.loads(request.body)
        ip_add = body_json['ip']
    except:
        ip_add = ""

    print(ip_add)
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(token=ip_add).values())
    print("ttttt",body_json['current_page'], body_json['next_page'])
    if df_manageClient.shape[0] == 0:
        return Response({"message":"Chưa có đăng ký"})
    DB_client = df_manageClient.iloc[0]['database_name']
    body_json = json.loads(request.body)
    
    
    # query metadata
    df_metadata =  pd.DataFrame(RecommenderStrategy.objects.using(DB_client).all().values())
    if df_metadata.shape[0] == 0:
        return Response({"message":"0 không có chiến lược"})
    # df_path = df_metadata[df_metadata.url == body_json['current_page']]
    df_path = df_metadata
    df_path['check_url'] = df_path['url'].apply(check_url,current_page = body_json['current_page'])
    df_path = df_path[df_path['check_url']==True]
    if df_path.shape[0] == 0:
        return Response({"message":"1 không có chiến lược ở trang này"})
   
    # check xpath
    click_path_send = body_json['xpath'].split(' > ')
    click_path_send = list(reversed(click_path_send))
    
    df_path['xpath'].replace( { r"\[[0-9]*\]" : "" }, inplace= True, regex = True)
    df_path['xpath'] = df_path['xpath'].str[1:]
    df_path['xpath'] = df_path.xpath.str.split('/')
    df_path['check_path'] = df_path.xpath.apply(check_path,click_path_send = click_path_send)
    df_click = df_path[df_path['check_path']==True]
    if df_click.shape[0] == 0:
        return Response({"message":"2 không có chiến lược ở đường click"})
    event_type = df_click['event_type'].iat[0]
    statistic = df_click['strategy'].iat[0]
    # print(event_type,statistic)
    # todo: add session and event
    if event_type == 'Login':
        new_token = id_generator(14)
        login_statistic(DB_client,body_json['text'], new_token)
        body_json['token'] = new_token
        
    df_user = pd.DataFrame(Customer.objects.using(DB_client).filter(token=body_json['token']).values())
    if df_user.shape[0] == 0:
        ran_num = random.randint(0,10000)
        statistic = ""
        if ran_num % 10 < 3:
            list_product = predict_model_hot(DB_client = DB_client)
            statistic = "hot"
        elif ran_num % 10 > 6: 
            statistic = "contentbase"
            product_filter = Product.objects.using(DB_client).filter(url=body_json['next_page'])
            if product_filter:
                product_id = product_filter.all()[0].product_id
                list_product = predict_model_contentbase(product_id,DB_client = DB_client)
        else: return Response({"message":"3 không có user tương ứng"})

        if isinstance(list_product, list): 
            info = add_more_information_for_product_id(list_product,DB_client)
            return Response({'type':statistic,'message': "recommend", "popup":"true","list_recommend":info},status=status.HTTP_200_OK)
        else: return Response({"message":"3 không có user tương ứng"})
    
    
    need_recommend = session_event_management(event_type=event_type, 
                            DB_client=DB_client,
                            user_id = df_user.iloc[0]['customer_id'],
                            product_url = body_json['next_page'])
    if event_type == 'Login':
        return Response({"message":"login","token":new_token})
    if need_recommend:
        list_product = ""
        if statistic == 'colab':
            list_product = predict_product_colab(df_user.iloc[0]['customer_id'],DB_client = DB_client)
        if statistic == 'demographic':
            list_product = predict_model_demographic(df_user.iloc[0]['customer_id'],DB_client = DB_client)
        if statistic == 'content':
            product_filter = Product.objects.using(DB_client).filter(url=body_json['next_page'])
            if product_filter:
                product_id = product_filter.all()[0].product_id
                list_product = predict_model_contentbase(product_id,DB_client = DB_client)
        if statistic == 'hot':
            list_product = predict_model_hot(DB_client = DB_client)
        if isinstance(list_product, list): 
            info = add_more_information_for_product_id(list_product,DB_client)
            return Response({'type':statistic,'message': "recommend", "popup":"true","list_recommend":info},status=status.HTTP_200_OK)

    return Response({"message":"Nothing"})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def train_colab_model_api(request):
    ip_add = ""
    try:
        body_json = json.loads(request.body)
        ip_add = body_json['ip']
    except:
        ip_add = ""
        
    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(token=ip_add).values())
    try:
        if df_manageClient.shape[0] == 0:
            body_json = json.loads(request.body)
            DB_client = body_json['database_name']
        else:
            DB_client = df_manageClient.iloc[0]['database_name']
    except:
        return Response({"message":"Chưa có đăng ký"},status=status.HTTP_406_NOT_ACCEPTABLE)
    train_model_colab(DB_client)
    return Response({"message":"Done"},status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def train_demographic_model_api(request):
    ip_add = ""
    try:
        body_json = json.loads(request.body)
        ip_add = body_json['ip']
    except:
        ip_add = ""

    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(token=ip_add).values())
    try:
        if df_manageClient.shape[0] == 0:
            body_json = json.loads(request.body)
            DB_client = body_json['database_name']
        else:
            DB_client = df_manageClient.iloc[0]['database_name']
    except:
        return Response({"Chưa có đăng ký"},status=status.HTTP_406_NOT_ACCEPTABLE)
    train_model_demographic(DB_client)
    return Response({"Done"},status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def train_hot_model_api(request):
    ip_add = ""
    try:
        body_json = json.loads(request.body)
        ip_add = body_json['ip']
    except:
        ip_add = ""

    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(token=ip_add).values())
    try:
        if df_manageClient.shape[0] == 0:
            body_json = json.loads(request.body)
            DB_client = body_json['database_name']
        else:
            DB_client = df_manageClient.iloc[0]['database_name']
    except:
        return Response({"Chưa có đăng ký"},status=status.HTTP_406_NOT_ACCEPTABLE)
    train_model_hot(DB_client)
    return Response({"Done"},status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def train_contentbase_model_api(request):
    ip_add = ""
    try:
        body_json = json.loads(request.body)
        ip_add = body_json['ip']
    except:
        ip_add = ""

    df_manageClient = pd.DataFrame(ManageAccount.objects.filter(token=ip_add).values())
    try:
        if df_manageClient.shape[0] == 0:
            body_json = json.loads(request.body)
            DB_client = body_json['database_name']
        else:
            DB_client = df_manageClient.iloc[0]['database_name']
    except:
        return Response({"Chưa có đăng ký"},status=status.HTTP_406_NOT_ACCEPTABLE)
    train_model_contentbase(DB_client)
    return Response({"Done"},status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def train_all_hot_model(request):
    for database_name in settings.DATABASES:
        train_model_hot(database_name)
    return Response({"Done"},status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def train_all_contentbase_model(request):
    for database_name in settings.DATABASES:
        train_model_contentbase(database_name)
    return Response({"Done"},status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def test(request):
    df_customer = pd.DataFrame(Product.objects.using("test1").values())
    # print()
    # df_customer = pd.DataFrame(Customer.objects.filter(token='x').values())
    # df_customer = Customer.objects.filter(token='fadfadfsdf').values_list('cus_id', flat=True)
    # print(df_customer)
    # Customer.objects.filter(username='test_ahi').update(token='aaaaa')
    # xx = "http://localhost:3000/product/{number}"
    # print(xx.replace("{number}","[0-9]*"))
    # # print(Customer.objects.aggregate(max_cus = Max('cus_id')))
    # session_user = Session.objects.filter(customer_id='1000006')
    # max_time     = session_user.aggregate(max_time=Max('end_time'))['max_time']
    # min_time     = session_user.aggregate(max_time=Min('end_time'))['max_time']
    # record       = session_user.filter(end_time = max_time)
    # print(max_time > min_time + timedelta(minutes=15))
    # print(Session.objects.all()[4].customer_id)
    # now_time     = datetime.now()
    # x = Session(start_time = now_time, end_time = now_time, customer_id = '1000000')
    # x.save()
    # print("aaa",session_user.aggregate(max_time=Max('end_time'))['max_time'])
    # print(predict_product("1000000",DB_client='test1'))
    # load_model(DB_client='test2')
    # df_customer = pd.DataFrame(Customer.objects.using('test1').all().values())
    # print(df_customer)
    # body_json = json.loads(request.body)
    # print(body_json['database'])
    # product = Product.objects.using("test2").filter(Q(product_id = 200003) if False else Q())
    # print(product)
    # print(predict_model_hot(3,'test2'))
    # magic_test('test1')
    # fields = [field.name for field in Session._meta.get_fields()]
    # print(fields)
    # print(fields)
    # print(getattr(Session, fields[0]))
    # field_type = Session._meta.get_field(fields[0]).get_internal_type()
    # print(field_type)
    # info = add_more_information_for_product_id(['200016','200018'],'test1')
    # print(settings.DATABASES)
    # for i in settings.DATABASES:
    #     print(i)
    list_used = list(ManageAccount.objects.values_list('database_name',flat=True))
    print(list_used)
    print('test1' in list_used)
    return Response({"mess"})