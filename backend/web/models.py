from django.db import models


class Product(models.Model):
    name = models.CharField(verbose_name='Название', max_length=355)
    price_with_discount = models.PositiveIntegerField(verbose_name='Цена без скидки')
    full_price = models.PositiveIntegerField(verbose_name='Полная цена', default=0)
    rating = models.PositiveIntegerField(verbose_name='Рейтинг', default=0)
    feedbacks = models.PositiveIntegerField(verbose_name='Кол-во отзывов', default=0)

    class Meta:
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'
        unique_together = ('name',)

    def __str__(self):
        return self.name

