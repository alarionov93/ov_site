import glob
import re

from docx import Document

if __name__ == '__main__':

	text_filenames = sorted(glob.glob('../media/txt/*.docx'), key=lambda x: int(re.findall(r'\d+', x)[0]))

	for name in text_filenames:
		f = open(name, 'rb')
		d = Document(f)
		# print(name)
		text = ''
		state = ''
		author = ''
		old_author = ''

		for p in d.paragraphs:
			try:
				author = re.findall(r'-+.*?\/(.*?)\/', p.text)[0]
				state = 'author'
			except IndexError:
				text += '<p>%s</p>\n' % p.text
				state = 'text'
				old_author = author
			finally:
				if state == 'author' and old_author:
					print(old_author)
					print(text)
					image_fragment = models.ImageFragment.objects.create(author=old_author, description=text)
					image_fragment.save()
					text = ''

	small_image_files = [x.split('..')[1] for x in glob.glob('../media/imgs/*.sm.jpg')]
	for i in small_image_files:
		link_prev = i
		link_full = link_prev.replace('.sm', '')
		print(link_prev, link_full)
		image = models.Image.objects.create(link_prev=link, link_full=link)
		image.save()
	

	# pure_image_files = set(sorted([x.split('..')[1] for x in glob.glob('../media/imgs/*.png')])) - small_image_files

	# print(image_files)

	# for link_full, link_prev in zip(pure_image_files, small_image_files):
		# print(link_full, link_prev)

		# image = models.Image.objects.create(link_prev=link, link_full=link)
		# image.save()
		# print(i.split('..')[1])
	
	# imageFragment1 = models.ImageFragment.objects.create(author='sm', description='test 2', image=image)
	# imageFragment2 = models.ImageFragment.objects.create(author='db', description='description of fragment 2', image=image)
	# imageFragment1.save()
	# imageFragment2.save()