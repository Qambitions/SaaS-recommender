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
   




#########################################################
###                                                   ###
#########################################################

# BusinessEntity

# class BusinessEntity(models.Model):
#     id = models.AutoField(primary_key=True)
#     entity_id = models.CharField(max_length=50, null=True, blank=True)
#     entity_name = models.CharField(max_length=50, null=True, blank=True)
#     slug = models.CharField(max_length=150, null=True, blank=True)
#     description = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True, null=True)
#     modified_at = models.DateTimeField(auto_now=True, null=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# # EntityEventRole

# class EntityEventRole(models.Model):
#     id = models.AutoField(primary_key=True)
#     entity_id = models.CharField(max_length=50, null=True, blank=True)
#     event_id = models.CharField(max_length=50, null=True, blank=True)
#     role_name = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)
    
    
# # EntityProductRole

# class EntityProductRole(models.Model):
#     id = models.AutoField(primary_key=True)
#     entity_id = models.CharField(max_length=50, null=True, blank=True)
#     product_id = models.CharField(max_length=50, null=True, blank=True)
#     role_name = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# # EventSimilarity

# class EventSimilarity(models.Model):
#     id = models.AutoField(primary_key=True)
#     source_id = models.CharField(max_length=50, null=True, blank=True)
#     target_id = models.CharField(max_length=50, null=True, blank=True)
#     similarity = models.DecimalField(max_digits=5, decimal_places=2)
#     algo = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# # ProductSimilarity

# class ProductSimilarity(models.Model):
#     id = models.AutoField(primary_key=True)
#     source_id = models.CharField(max_length=50, null=True, blank=True)
#     target_id = models.CharField(max_length=50, null=True, blank=True)
#     similarity = models.DecimalField(max_digits=5, decimal_places=2)
#     algo = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# # Interaction

# class Interaction_f(models.Model):
#     id = models.AutoField(primary_key=True)
#     interaction_id = models.CharField(max_length=50, null=True, blank=True)
#     session_id = models.CharField(max_length=50, null=True, blank=True)
#     visitor_id = models.CharField(max_length=50, null=True, blank=True)
#     customer_id = models.CharField(max_length=50, null=True, blank=True)
#     visit_date = models.DateField(null=True, blank=True)
#     visit_timestamp = models.IntegerField(null=True, blank=True)
#     operating_system = models.CharField(max_length=150, null=True, blank=True)
#     device_category = models.CharField(max_length=150, null=True, blank=True)
#     browser = models.CharField(max_length=150, null=True, blank=True)
#     page_title = models.CharField(max_length=150, null=True, blank=True)
#     page_location = models.CharField(max_length=150, null=True, blank=True)
#     traffic_source = models.CharField(max_length=150, null=True, blank=True)
#     event_name = models.CharField(max_length=150, null=True, blank=True)
#     geolocation_city = models.CharField(max_length=50, null=True, blank=True)
#     geolocation_state = models.CharField(max_length=50, null=True, blank=True)
#     geolocation_country = models.CharField(max_length=50, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True, null=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)
    

# #Intraction by Google Analytics:
# class Interaction_ga(models.Model):
#     id = models.AutoField(primary_key=True)
#     date = models.DateField(null=True, blank=True)
#     event_name = models.CharField(max_length=50, null=True, blank=True)
#     page_location = models.CharField(max_length=500, null=True, blank=True)
#     operating_system = models.CharField(max_length=150, null=True, blank=True)
#     device_category = models.CharField(max_length=150, null=True, blank=True)
#     country = models.CharField(max_length=150, null=True, blank=True)
#     browser = models.CharField(max_length=150, null=True, blank=True)
#     event_count = models.IntegerField(null=True, blank=True)
#     session_count = models.IntegerField(null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)
    
  
# #WebActivityType   
# class WebActivityType(models.Model):
#     name = models.CharField(max_length=60, null=True, blank=True)
#     description = models.TextField(null=True, blank=True)
#     value = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    
    
# WebActivity

# class WebActivity(models.Model):
#     page_id = models.CharField(max_length=50, null=True, blank=True)
#     session = models.CharField(max_length=50, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True, null=True)
#     browser = models.CharField(max_length=80, null=True)
#     visitor = models.CharField(max_length=20)
#     activity_type = models.ForeignKey(
#         WebActivityType, on_delete=models.CASCADE)


# InteractionLocation

# class InteractionLocation(models.Model):
#     id = models.AutoField(primary_key=True)
#     interaction_id = models.CharField(max_length=50, null=True, blank=True)
#     location_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# WebPage

# class WebPage(models.Model):
#     id = models.AutoField(primary_key=True)
#     page_id = models.CharField(max_length=50, null=True, blank=True)
#     url = models.CharField(max_length=200)
#     page_path = models.CharField(max_length=200)
#     page_title = models.CharField(max_length=150, null=True, blank=True)
#     search_keyword = models.CharField(max_length=150, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# Contact

# class Contact(models.Model):
#     id = models.AutoField(primary_key=True)
#     contact_id = models.CharField(max_length=50, null=True, blank=True)
#     contact_name = models.CharField(max_length=50, null=True, blank=True)
#     email = models.CharField(max_length=50, null=True, blank=True)
#     phone1 = models.CharField(max_length=50, null=True, blank=True)
#     phone2 = models.CharField(max_length=50, null=True, blank=True)
#     url = models.CharField(max_length=50, null=True, blank=True)
#     business_hour = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# EntityContactPoint

# class EntityContactPoint(models.Model):
#     id = models.AutoField(primary_key=True)
#     entity_id = models.CharField(max_length=50, null=True, blank=True)
#     contact_id = models.CharField(max_length=50, null=True, blank=True)
#     contact_role = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# EventProduct

# class EventProduct(models.Model):
#     id = models.AutoField(primary_key=True)
#     event_id = models.CharField(max_length=50, null=True, blank=True)
#     product_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# Event Preference

# class EventPreference(models.Model):
#     id = models.AutoField(primary_key=True)
#     preference_id = models.CharField(max_length=50, null=True, blank=True)
#     preference_type = models.CharField(max_length=50, null=True, blank=True)
#     preference_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
#     event_id = models.CharField(max_length=50, null=True, blank=True)
#     activity_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# Product Preferene

# class ProductPreference(models.Model):
#     id = models.AutoField(primary_key=True)
#     preference_id = models.CharField(max_length=50, null=True, blank=True)
#     preference_type = models.CharField(max_length=50, null=True, blank=True)
#     preference_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
#     product_id = models.CharField(max_length=50, null=True, blank=True)
#     activity_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)
    
# Item Preferene

# class ItemPreference(models.Model):
#     id = models.AutoField(primary_key=True)
#     preference_id = models.CharField(max_length=50, null=True, blank=True)
#     preference_type = models.CharField(max_length=50, null=True, blank=True)
#     preference_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
#     item_id = models.CharField(max_length=50, null=True, blank=True)
#     item_type = models.CharField(max_length=50, null=True, blank=True)
#     interaction_id = models.CharField(max_length=50, null=True, blank=True)
#     interaction_event_name = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# Session
# class Session(models.Model):
#     id = models.AutoField(primary_key=True)
#     visit_id = models.CharField(max_length=50, null=True, blank=True)
#     visit_date = models.DateField(null=True, blank=True)
#     visit_start_time = models.DateTimeField(null=True, blank=True)
#     visit_end_time = models.DateTimeField(null=True, blank=True)
#     visit_number = models.CharField(max_length=50, null=True, blank=True)
#     visit_duration = models.IntegerField(null=True)
#     operating_system = models.CharField(max_length=150, null=True, blank=True)
#     device_category = models.CharField(max_length=150, null=True, blank=True)
#     device_brand = models.CharField(max_length=150, null=True, blank=True)
#     browser = models.CharField(max_length=150, null=True, blank=True)
#     page_title = models.CharField(max_length=150, null=True, blank=True)
#     page_location = models.CharField(max_length=150, null=True, blank=True)
#     event_name = models.CharField(max_length=150, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True, null=True)
#     customer_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)
    
# class SessionLocation(models.Model):
#     id = models.AutoField(primary_key=True)
#     session_id = models.CharField(max_length=50, null=True, blank=True)
#     location_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)




# Journey
# class Journey(models.Model):
#     id = models.AutoField(primary_key=True)
#     journey_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)



# ProductResource

# class ProductResource(models.Model):
#     id = models.AutoField(primary_key=True)
#     product_id = models.CharField(max_length=50, null=True, blank=True)
#     resource_id = models.CharField(max_length=50, null=True, blank=True)
#     description = models.TextField(null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# EventResource

# class EventResource(models.Model):
#     id = models.AutoField(primary_key=True)
#     event_id = models.CharField(max_length=50, null=True, blank=True)
#     resource_id = models.CharField(max_length=50, null=True, blank=True)
#     description = models.TextField(null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# EntityResource

# class EntityResource(models.Model):
#     id = models.AutoField(primary_key=True)
#     entity_id = models.CharField(max_length=50, null=True, blank=True)
#     resource_id = models.CharField(max_length=50, null=True, blank=True)
#     description = models.TextField(null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# EntityLocation

# class EntityLocation(models.Model):
#     id = models.AutoField(primary_key=True)
#     entity_id = models.CharField(max_length=50, null=True, blank=True)
#     location_id = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# EventLocation

# class EventLocation(models.Model):
#     id = models.AutoField(primary_key=True)
#     event_id = models.CharField(max_length=50, null=True, blank=True)
#     location_id = models.CharField(max_length=50, null=True, blank=True)
#     room = models.CharField(max_length=50, null=True, blank=True)
#     description = models.TextField(null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)


# Location

# class GeoLocation(models.Model):
#     id = models.AutoField(primary_key=True)
#     location_id = models.CharField(max_length=50, null=True, blank=True)
#     location_name = models.CharField(max_length=50, null=True, blank=True)
#     address = models.CharField(max_length=150, null=True, blank=True)
#     address2 = models.CharField(max_length=150, null=True, blank=True)
#     longitude = models.CharField(max_length=50, null=True, blank=True)
#     latitude = models.CharField(max_length=50, null=True, blank=True)
#     city = models.CharField(max_length=50, null=True, blank=True)
#     state = models.CharField(max_length=50, null=True, blank=True)
#     region = models.CharField(max_length=50, null=True, blank=True)
#     zip = models.CharField(max_length=50, null=True, blank=True)
#     country = models.CharField(max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# Resource

# class Resource(models.Model):
#     id = models.AutoField(primary_key=True)
#     resource_id = models.CharField(max_length=50, null=True, blank=True)
#     resource_name = models.CharField(max_length=150, null=True, blank=True)
#     resource_type = models.CharField(max_length=50, null=True, blank=True)
#     resource_url = models.CharField(max_length=200, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)

# PriceType

# class PriceType(models.Model):
#     id = models.AutoField(primary_key=True)
#     price_type_id = models.CharField(max_length=50, null=True, blank=True)
#     price_type_name = models.CharField(max_length=50, null=True, blank=True)
#     price_type_currency = models.CharField(
#         max_length=50, null=True, blank=True)
#     import_id = models.CharField(max_length=30, null=True, blank=True)