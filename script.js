var matTemp;
var cooler;
var material;
var matWeight;
var coolerTemp;
var coolerVolume, coolerWeight;
var coolingConst;
var surface;
var flow;
var coolerMaxTemp, coolerMinTemp;
var flowTemp;
var pumpOn = false;
var coolers =[
    {   
        name: "Water",
        heatcapacity: 4189.9,
        heatexchange: 500,
        density: 998.203
    },  
    {   
        name: "Oil",
        heatcapacity: 1885,
        heatexchange: 2000,
        density: 900
    }
];
var materials =[
    {   
        name: "Steel",
        heatcapacity: 520
    },    
    {   
        name: "Gold",
        heatcapacity: 129
    },
    {   
        name: "Aluminium",
        heatcapacity: 900
    },
    {   
        name: "Lead",
        heatcapacity: 128
    }
];
//smoothscrol
$("#simulation").click(function(){
     $('html, body').animate({
        scrollTop: $("#yourSimulation").offset().top
    }, 2000);
});
$("#report").click(function(){
     $('html, body').animate({
        scrollTop: $("#yourReport").offset().top
    }, 2000);
});
//pokazanie value suwaków
document.getElementById("materialAmount").addEventListener("change",function(){
    document.getElementById("numMaterialAmount").value = this.value;
});
document.getElementById("materialTemp").addEventListener("change",function(){
    document.getElementById("numMaterialTemp").value = this.value;
});
document.getElementById("materialSurface").addEventListener("change",function(){
    document.getElementById("numMaterialSurface").value = this.value;
});
document.getElementById("coolerAmount").addEventListener("change",function(){
    document.getElementById("numCoolerAmount").value = this.value;
});
document.getElementById("coolerTemp").addEventListener("change",function(){
    document.getElementById("numCoolerTemp").value = this.value;
});
document.getElementById("coolerMaxTemp").addEventListener("change",function(){
    document.getElementById("numCoolerMaxTemp").value = this.value;
});
document.getElementById("coolerFlow").addEventListener("change",function(){
    document.getElementById("numCoolerFlow").value = this.value;
});
document.getElementById("coolerFlowTemp").addEventListener("change",function(){
    document.getElementById("numCoolerFlowTemp").value = this.value;
});
document.getElementById("numMaterialAmount").value = document.getElementById("materialAmount").value;
document.getElementById("numMaterialTemp").value = document.getElementById("materialTemp").value;
document.getElementById("numMaterialSurface").value = document.getElementById("materialSurface").value;
document.getElementById("numCoolerAmount").value = document.getElementById("coolerAmount").value;
document.getElementById("numCoolerTemp").value = document.getElementById("coolerTemp").value;
document.getElementById("numCoolerMaxTemp").value = document.getElementById("coolerMaxTemp").value;
document.getElementById("numCoolerFlow").value = document.getElementById("coolerFlow").value;
document.getElementById("numCoolerFlowTemp").value = document.getElementById("coolerFlowTemp").value;

var buttons1 = document.querySelectorAll(".material");
var buttons2 = document.querySelectorAll(".cooler");

for (var i = 0; i < buttons1.length; i++) {
    buttons1[i].addEventListener("click", function(){
        for (var i = 0; i < buttons1.length; i++) {
            buttons1[i].classList.remove("selected");
        }
        this.classList.add("selected");
    });
}

for (var i = 0; i < buttons2.length; i++) {
    buttons2[i].addEventListener("click", function(){
        for (var i = 0; i < buttons2.length; i++) {
            buttons2[i].classList.remove("selected");
        }
        this.classList.add("selected");
    });
}
//uruchomienie symulacji
var runBtn = document.querySelector("#runSimulation");

runBtn.addEventListener("click", function(){
    matTemp = Number(document.getElementById("numMaterialTemp").value);
    matWeight = Number(document.getElementById("numMaterialAmount").value);
    coolerTemp = Number(document.getElementById("numCoolerTemp").value);
    coolerVolume = Number(document.getElementById("numCoolerAmount").value) / 1000;
    surface = Number(document.getElementById("numMaterialSurface").value);
    coolerMaxTemp = Number(document.getElementById("numCoolerMaxTemp").value) + coolerTemp;
    flow = Number(document.getElementById("numCoolerFlow").value) / 1000;
    flowTemp = Number(document.getElementById("numCoolerFlowTemp").value);
    
    for (var i = 0; i < buttons1.length; i++) {
        if(buttons1[i].classList[2]){
            material = materials[i];
        }
    }
    for (var i = 0; i < buttons2.length; i++) {
        if(buttons2[i].classList[2]){
            cooler = coolers[i];
        }
    }
    coolingConst = (cooler.heatexchange * surface)/(material.heatcapacity * matWeight);
    coolerMinTemp = coolerTemp - (coolerMaxTemp - coolerTemp);
    coolerWeight = cooler.density * coolerVolume;

    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawCurveTypes);
});

function chartData(currentTime,stopTime,materialTemp,coolerTemp,k){
    var data = [
        data1 = [],
        data2 = []
    ];
    var startTemp = materialTemp;
    var startCoolerTemp = coolerTemp;
    var sampleRate = 0.1;
    data1.push([currentTime, materialTemp, coolerTemp]);
    while(currentTime <= stopTime) {
        currentTime += sampleRate;
        if(materialTemp > coolerTemp) {
            var previousTemp = materialTemp;
            // materialTemp = (materialTemp - coolerTemp) * Math.exp(-k * sampleRate) + coolerTemp;
            materialTemp = (startTemp - startCoolerTemp) * Math.exp(-k * currentTime) + startCoolerTemp;
            var q = matWeight * material.heatcapacity * (previousTemp - materialTemp);
            var tempChange = q / (coolerWeight * cooler.heatcapacity);
            coolerTemp = coolerTemp + tempChange;
        }

        if(!pumpOn && coolerTemp > coolerMaxTemp) {
            pumpOn = true;
        } else if(pumpOn && coolerTemp < coolerMinTemp) {
            pumpOn = false;
        }

        if(pumpOn) {
            coolerTemp = flowTemp * flow * sampleRate / coolerVolume + coolerTemp * (coolerVolume - flow * sampleRate) / coolerVolume;
        }

        data1.push([currentTime, materialTemp, coolerTemp]);
        data2.push([currentTime, pumpOn ? (flow * 1000) : 0]);
    }
    return data;
}

function drawCurveTypes() {
    var data = new google.visualization.DataTable();
    var data2 = new google.visualization.DataTable();

    data.addColumn('number', 'X');
    data.addColumn('number', material.name);
    data.addColumn('number', cooler.name);

    data2.addColumn('number', 'X');
    data2.addColumn('number', "Przepływ");

    var results = chartData(0, 200, matTemp, coolerTemp, coolingConst);
    data.addRows(results[0]);
    data2.addRows(results[1]);

    var options = {
        hAxis: {
            title: 'Czas[s]'
        },
        vAxis: {
            title: 'Temperatura[°C]'
        },
        width: 900,
        height: 500,
        series: {
            1: {curveType: 'function'}
        }
    };

    var options2 = {
        hAxis: {
            title: 'Czas[s]'
        },
        vAxis: {
            title: 'Przepływ[l/s]'
        },
        width: 900,
        height: 500,
        series: {
            1: {curveType: 'function'}
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.LineChart(document.getElementById('chart_div2'));

    chart.draw(data, options);
    chart2.draw(data2, options2);
}

