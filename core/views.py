import json
import glob
import re
import os

from docx import Document
from ov_site import settings
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponse
from core import models
import glob
# Create your views here.

def index(request):
	# image_fragments = models.ImageFragment.objects.all()
	# print(image_fragments) 
	# x_lt: 97, y_lt: 35, x_rb: 314, y_rb: 185
	# x_lt: 100, y_lt: 332, x_rb: 299, y_rb: 135
	# x_lt: 104, y_lt: 520, x_rb: 300, y_rb: 57
	# for frg in image_fragments:
		# frg.delete()
	
	# images = models.Image.objects.all()
	# for img in images:
	# 	img.delete()

	# for frg in image_fragments:
		# print(frg.id, frg.author)
		# frg.delete()
		# frg.image_id = None
		# frg.image_id = None
		# frg.x_lt = None
		# frg.y_lt = None
		# frg.x_rb = None
		# frg.y_rb = None
		# frg.save()

	# imageFragment1 = models.ImageFragment.objects.create(author='Daniel Kurushin', description='In the following example, the <div> element will be empty for “Mercury”, but populated for “Earth”. That’s because Earth has a non-null capital property, whereas “Mercury” has null for that property.')
	# imageFragment2 = models.ImageFragment.objects.create(author='Alex Larionov', description='It’s important to understand that the if binding really is vital to make this code work properly. Without it, there would be an error when trying to evaluate capital.cityName in the context of “Mercury” where capital is null. In JavaScript, you’re not allowed to evaluate subproperties of null or undefined values.')
	# imageFragment1.save()
	# imageFragment2.save()
	# path = os.path.dirname(__file__).split('core')[0]
	upload_files_mode = request.GET.get('upload', None)
	if upload_files_mode == '1':
		base_dir = settings.BASE_DIR

		# text_filenames = sorted(glob.glob('%s/media/txt/*.docx' % base_dir), key=lambda x: int(re.findall(r'\d+', x)[0]))

		# cnt = 0
		# # print(text_filenames)

		# text = ''
		# state = ''
		# author = ''
		# old_author = ''

		# for name in text_filenames:
		# 	f = open(name, 'rb')
		# 	d = Document(f)
		# 	# print(name)
		# 	for p in d.paragraphs:
		# 		# print(p.text)
		# 		# cnt += 1
		# 		# print(cnt)
		# 		# if cnt < 60:
		# 			# print(state)
		# 		try:
		# 			# if state == 'author' and old_author:
		# 				# print(old_author)
		# 				# print(text)
		# 				# text = '>>'
		# 			state = 'author'
		# 			author = re.findall(r'-+.*?\/(.*?)\/', p.text)[0]
		# 		except IndexError:
		# 			# try:
		# 			text += '<p>%s</p>\n' % p.text
		# 			state = 'text'
		# 			old_author = author
		# 				# print(text)
		# 			# except:
		# 				# print(1)
		# 		finally:
		# 			if state == 'author' and old_author:
		# 				# pass
		# 				print(old_author)
		# 				# print(author)
		# 				print(text)
		# 				image_fragment = models.ImageFragment.objects.create(author=old_author, description=text)
		# 				image_fragment.save()
		# 				text = ''
		# 			# elif state == 'text' and old_author:
		# 				# text += '<p>%s</p>\n' % p.text
		# 				# state = 'text'
		# 				# old_author = author
		# 				# print(old_author)
		# 				# print(text)

		# imgs_path = '%s/media/imgs/*.sm.jpg' % base_dir
		# small_image_files = glob.glob(imgs_path)
		# sm_files = sorted(small_image_files, key=lambda file: int(os.path.basename(file).split('-')[0]))
		# for i in sm_files:
		# 	i = i.split(base_dir)[1]
		# 	link_prev = i
		# 	link_full = link_prev.replace('.sm', '')
		# 	print(link_prev, link_full)
		# 	image = models.Image.objects.create(link_prev=link_prev, link_full=link_full)
		# 	image.save()

	admin_status = 0
	admin_url_prefix = 'a34f25h16'
	req_stat = request.GET.get('stat', None)
	if req_stat:
		if req_stat == admin_url_prefix:
			admin_status = 1

	# print(admin_status)

	return render(request, 'c_index.html', context = {'admin': admin_status})

@csrf_exempt
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
			'previews': [x.to_json() for x in models.Image.objects.all().order_by('id')],
			'texts': [x.to_json() for x in models.ImageFragment.objects.all()],
		}

		return HttpResponse(json.dumps(data), content_type='application/json')

# In params: image_id, img_fragment_id, x_lt, y_lt, x_rb, y_rb
@csrf_exempt
def set_relation_of_fragment(request):
	if request.is_ajax() and request.method == 'POST':
		if request.POST.get('text_fragments'):
			for frg in json.loads(request.POST.get('text_fragments')):
				image_fragment = models.ImageFragment.objects.get(id=frg['id'])
				image_fragment.image = models.Image.objects.get(id=frg['image_id'])
				image_fragment.x_lt = frg['x_lt']
				image_fragment.y_lt = frg['y_lt']
				image_fragment.x_rb = frg['x_rb']
				image_fragment.y_rb = frg['y_rb']
				image_fragment.save()

			ctx = {'status': 0, 'previews': [x.to_json() for x in models.Image.objects.all()]}
			# get coordinates and image_id for ImageFragment
			return HttpResponse(json.dumps(ctx), content_type='application/json')
	
	return HttpResponse(json.dumps({'ERROR: Method not allowed.'}), content_type='application/json')



