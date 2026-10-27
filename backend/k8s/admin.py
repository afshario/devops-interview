from django.contrib import admin

from .models import App, Deployment


admin.site.register(App)
admin.site.register(Deployment)