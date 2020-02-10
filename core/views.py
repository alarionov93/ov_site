import json

from django.shortcuts import render
from django.http import HttpResponse
from core import models
from docx import Document
import glob
# Create your views here.

def index(request):
	image_fragments = models.ImageFragment.objects.all()
	print(image_fragments)
	# for i_f in image_fragments:
		# i_f.delete()

	# imageFragment1 = models.ImageFragment.objects.create(author='sm', description='test 2')
	# imageFragment2 = models.ImageFragment.objects.create(author='db', description='description of fragment 2')
	# imageFragment1.save()
	# imageFragment2.save()

	return render(request, 'c_index.html', context = {'test': 'test'})

def previews(request):
	if request.is_ajax() and request.method == 'POST':
		# data = [
		# 	{
		# 		'id': 1,
		# 		'link_prev': '/media/imgs/test1.png',
		# 		'link_full': '/media/imgs/test1.png',
		# 		'fragments': [
		# 			{
		# 				'id': 1,
		# 				'author': 'og',
		# 				'description': 'test',
		# 			},
		# 			{
		# 				'id': 2,
		# 				'author': 'vs',
		# 				'description': 'description',
		# 			},
		# 		],
		# 	},
		# 	# {'id': 2, 'linkPrev': '/media/imgs/test2.png', 'linkFull': '/media/imgs/test2.png', 'author': 'vs', 'description': 'description'},
		# ]
		data = {
			'previews': [x.to_json() for x in models.Image.objects.all()],
			'texts': [x.to_json() for x in models.ImageFragment.objects.all()],
		}

		return HttpResponse(json.dumps(data), content_type='application/json')

# In params: image_id, img_fragment_id, x_lt, y_lt, x_rb, y_rb
def set_relation_of_fragment(request):
	if request.method == 'POST':
		ctx = {}
		# get coordinates and image_id for ImageFragment
		return HttpResponse(json.dumps(ctx), content_type='application/json')
	
	return HttpResponse(json.dumps({'ERROR: Method not allowed.'}), content_type='application/json')



