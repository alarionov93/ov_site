import glob

if __name__ == '__main__':

	text_filenames = glob.glob('../documents/*.docx')
	
	for name in text_filenames:
		f = open(name, 'rb')
		d = Document(f)
		for p in d.paragraphs:
			print(p.text)

	glob.glob('../media/*.png')

	# Test - move to tests.py
	image = models.Image.objects.create(link_prev='/media/imgs/test2.png', link_full='/media/imgs/test2.png')
	image.save()
	imageFragment1 = models.ImageFragment.objects.create(author='sm', description='test 2', image=image)
	imageFragment2 = models.ImageFragment.objects.create(author='db', description='description of fragment 2', image=image)
	imageFragment1.save()
	imageFragment2.save()