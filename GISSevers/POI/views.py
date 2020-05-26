from django.shortcuts import render,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers

from .models import POIModels


# Create your views here.
def Index(request):
    return render(request,"index.html")
@csrf_exempt
def AddPOI(request):
    if(request.method == "POST"):
        poi = POIModels()
        poi.position = request.POST.get("position")
        poi.name = request.POST.get("name")
        poi.label = request.POST.get("label")
        poi.save()
        return HttpResponse("status:200")

@csrf_exempt
def SearchPOI(request):
    if(request.method == "POST"):
        poiqueryset = POIModels.objects.filter(label = request.POST.get("label"))
        data = serializers.serialize('json', queryset=poiqueryset)
        # 3. 返回
        return HttpResponse(data)