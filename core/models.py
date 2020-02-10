from django.db import models

# Create your models here.

class Image(models.Model):
	# required
	link_prev = models.CharField(max_length=255, default='', null=False, blank=False, unique=False)
	link_full = models.CharField(max_length=255, default='', null=False, blank=False, unique=False)

	def get_image_fragments(self):
		# print([x.to_json() for x in ImageFragment.objects.filter(image_id=self.id)])
		return [x.to_json() for x in ImageFragment.objects.filter(image_id=self.id)]

	def to_json(self):
		if self.id:
			return {
	            'id': self.id,
	            'link_prev': self.link_prev,
	            'link_full': self.link_full,
	            'fragments': self.get_image_fragments(),
	        }
		else:
			raise Exception('Can not get ID of the record of Image!')
	
	class Meta:
		db_table = 'images'
		verbose_name = 'Изображение'
		verbose_name_plural = 'Изображения'


class ImageFragment(models.Model):
	# required
	author = models.CharField(max_length=255, default='', null=False, blank=False, unique=False)
	description = models.TextField(default='', null=False, blank=False, unique=False)
	# not required
	x_lt = models.PositiveIntegerField(default=0, null=True, blank=True, unique=False)
	y_lt = models.PositiveIntegerField(default=0, null=True, blank=True, unique=False)
	x_rb = models.PositiveIntegerField(default=0, null=True, blank=True, unique=False)
	y_rb = models.PositiveIntegerField(default=0, null=True, blank=True, unique=False)
	is_chosen = models.BooleanField(default=False, null=True, blank=True, unique=False)
	image = models.ForeignKey('Image', to_field='id', db_column='image_id', on_delete=models.CASCADE, null=True, blank=True,
                               verbose_name='Изображение')

	@property
	def has_image(self):
		return self.image is not None
		# return False

	def to_json(self):
		if self.id:
			return {
	            'id': self.id,
	            'author': self.author,
	            'description': self.description,
	            'x_lt': self.x_lt,
				'y_lt': self.y_lt,
				'x_rb': self.x_rb,
				'y_rb': self.y_rb,
				'has_image': self.has_image,
	        }
		else:
			raise Exception('Can not get ID of the record of ImageFragment!')

	class Meta:
		db_table = 'image_fragments'
		verbose_name = 'Фрагмент изображения'
		verbose_name_plural = 'Фрагменты изображения'





