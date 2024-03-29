# Generated by Django 3.2.5 on 2023-02-01 05:53

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('username', models.CharField(blank=True, max_length=150, primary_key=True, serialize=False, unique=True)),
                ('name_company', models.CharField(blank=True, max_length=150)),
                ('database_name', models.CharField(blank=True, max_length=150)),
                ('service', models.CharField(blank=True, max_length=150)),
                ('token', models.CharField(blank=True, max_length=150)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('email', models.EmailField(max_length=254, unique=True)),
            ],
        ),
    ]
