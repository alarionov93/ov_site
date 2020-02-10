from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='site_index'),
	# path('register', views.register, name='register'),
	path('previews/get/', views.previews, name='previews'),
]