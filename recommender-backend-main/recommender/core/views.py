from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, generics
from rest_framework.decorators import api_view,  authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, UserSerializerWithToken
from rest_framework.permissions import AllowAny


import json
from . import models
@api_view(['POST'])
def change_password(request):
    try:
        request_body = json.loads(request.body)
        user_name = request_body['userName']
        new_password = request_body['confirmedPassword']
        u = User.objects.get(username=user_name)
        u.set_password(new_password)
        u.save()
        return Response({})
        
    except Exception as error:
        print(error)
        return Response({'message': "Change password failed"})
    
@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """

    # permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        snippets = User.objects.all()
        serializer = UserSerializer(snippets, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def UserCreate(request):
    try: 
        body_json = json.loads(request.body)
        username = body_json['username']
        password= body_json['password']
        email=body_json['email']
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return Response({"Successfully"})
    except Exception as error:
        return Response(error)

