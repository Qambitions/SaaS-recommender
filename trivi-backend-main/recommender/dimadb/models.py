from django.db import models
from django.contrib.auth.models import User

# Create metadata mode
class ManageAccount(models.Model):
    username      = models.CharField(max_length=150, primary_key=True, blank=True, unique=True)
    created_at    = models.DateTimeField(auto_now_add=True, null=True)
    name_company  = models.CharField(max_length=150, null=False, blank=True)
    database_name = models.CharField(max_length=150, null=False, blank=True)
    service       = models.CharField(max_length=150, null=False, blank=True)
    token         = models.CharField(max_length=150, null=False, blank=True)
    
# DB for Machine Learning Model

class LdaSimilarityVersion(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    n_topics = models.IntegerField(null=True)
    item_type = models.CharField(max_length=150, null=True, blank=True)
    n_products = models.IntegerField(null=True)

    def __str__(self):
        return format(self.created_at)


class LdaSimilarity(models.Model):
    source = models.CharField(max_length=150, null=True, blank=True)
    target = models.CharField(max_length=150, null=True, blank=True)
    item_type = models.CharField(max_length=150, null=True, blank=True)
    similarity = models.DecimalField(max_digits=10, decimal_places=7)
    version = models.CharField(max_length=150, null=True, blank=True)


# Import_info:
class ImportInfo(models.Model):
    id = models.AutoField(primary_key=True,null=False)
    table_name = models.CharField(max_length=50, null=True, blank=True)
    source_name = models.CharField(max_length=200, null=True, blank=True)
    import_date = models.DateTimeField(auto_now_add=True)

# Customer
class Customer(models.Model):
    # id = models.AutoField(primary_key=True,null=False)
    customer_id = models.CharField(primary_key=True, max_length=50,null=False, blank=True)
    username = models.CharField(max_length=30, null=False, blank=True)
    token = models.CharField(max_length=100, null=True, blank=True)


class CustomerProfile(models.Model):
    customer_id = models.CharField(max_length=50, null=False, blank=True, primary_key=True)
    dob = models.DateTimeField(null=False, blank=True)
    gender = models.CharField(max_length=10, null=False, choices=(
        ('male', 'male'), ('female', 'female')))
    city = models.CharField(max_length=150, null=False, blank=True)
    country = models.CharField(max_length=150, null=True, blank=True)
    email = models.CharField(max_length=50, null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    phone = models.CharField(max_length=10, null=True, blank=True)


# New_product:
class Product(models.Model):
    # id = models.AutoField(primary_key=True,null=False)
    product_id = models.CharField(primary_key=True,max_length=150, unique=True,null=False)
    product_name = models.CharField(max_length=150, null=True, blank=True)
    category = models.CharField(max_length=150, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)
    revenue = models.IntegerField(null=True, blank=True)
    url = models.CharField(max_length=150, null=False, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.TextField(null=True, blank=True)
   
# Session
class Session(models.Model):
    # id = models.AutoField(primary_key=True)
    session_id = models.AutoField(primary_key=True,null=False, blank=True, unique=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    customer_id = models.CharField(max_length=50, null=True, blank=True)
    

# New_event:
class WebEvent(models.Model):
    # id = models.AutoField(primary_key=True)
    event_id = models.AutoField(primary_key=True, unique=True)
    event_type = models.CharField(max_length=150, null=True, blank=True)
    session_id = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

class EventItem(models.Model):
    event_id = models.CharField(max_length=150)
    product_id = models.CharField(max_length=50,null=True)
    quantity = models.IntegerField(null=False)
    price = models.IntegerField(null=False)

class BusinessTransaction(models.Model):
    # id = models.AutoField(primary_key=True)
    transaction_id = models.AutoField(primary_key=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    transaction_price = models.IntegerField(null=False)
    transaction_revenue = models.IntegerField(null=False)
    transaction_shipping = models.IntegerField(null=False)
    transaction_status = models.CharField(max_length=150, null=True, blank=True)    
    session_id = models.CharField(max_length=50, null=True, blank=True)

class TransactionItem(models.Model):
    transaction_id = models.CharField(max_length=150)
    product_id = models.CharField(max_length=50)
    quantity = models.IntegerField(null=False)
    price = models.IntegerField(null=False)
    revenue = models.IntegerField(null=False)

# ProductSimilarity
class SimilarProduct(models.Model):
    product_id1 = models.CharField(max_length=50, null=True, blank=True)
    product_id2 = models.CharField(max_length=50, null=True, blank=True)
    compatibility = models.DecimalField(max_digits=5, decimal_places=2)

# CustomerSimilarity
class SimilarCustomer(models.Model):
    customer_id1 = models.CharField(max_length=50, null=True, blank=True)
    customer_id2 = models.CharField(max_length=50, null=True, blank=True)
    compatibility = models.DecimalField(max_digits=5, decimal_places=2)


class RecommenderModel(models.Model):
    model_id = models.AutoField(primary_key = True,null=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    model_type = models.CharField(max_length=50, null=True, blank=True)
    model_path = models.CharField(max_length=150, null=True, blank=True)


class RecommenderStrategy(models.Model):
    id = models.AutoField(primary_key = True,null=False, blank=True)
    strategy = models.CharField(max_length=50, null=True, blank=True)
    event_type = models.CharField(max_length=50, null=True, blank=True)
    url = models.CharField(max_length=300, null=True, blank=True)
    xpath = models.CharField(max_length=1000, null=True, blank=True)

class Scheduler(models.Model):
    scheduler_id = models.AutoField(primary_key = True,null=False, blank=True)
    strategy = models.CharField(max_length=50, null=True, blank=True)
    database_name = models.CharField(max_length=50, null=True, blank=True)
    cycle_time = models.IntegerField(null=False)
   
