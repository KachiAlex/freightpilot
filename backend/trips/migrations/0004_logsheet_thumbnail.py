from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0003_trip_rest_preferences'),
    ]

    operations = [
        migrations.AddField(
            model_name='logsheet',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='logs/thumbnails/'),
        ),
    ]
