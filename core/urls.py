from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='site_index'),
	path('?stat=a34f25h16', views.index, name='site_index'),
	path('fragments/set/', views.set_relation_of_fragment, name='fragments'),
	path('previews/get/', views.previews, name='previews'),
]