let mqtt = require('mqtt');
const fs = require("fs");
 
let settings = {
	port: 1883,
	username: "studenti",
	password: "studentiDRUIDLAB_1"
};


class PatientBioData{

    constructor(name, surname, age, sex){
        this.patientID = "";
        this.name = name;
        this.surname = surname;
        this.age = age;
        this.sex = sex;
        this.phoneNumber = "";
        this.fetchID();

        const exists = fs.existsSync("./telephone.txt");

        if(exists){
            let buffer = fs.readFileSync("./telephone.txt");
            this.phoneNumber = buffer.toString();
        }
    }

    genRandomString(length) {
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let charLength = chars.length;
        let result = '';
        for (let i = 0; i < length; i++ ) {
            result += chars.charAt(Math.floor(Math.random() * charLength));
        }
        return result;
    } 

    fetchID(){
        const exists = fs.existsSync("./sensorID.txt");

        if(!exists){
            this.patientID = this.genRandomString(24);
            fs.writeFileSync("./sensorID.txt", this.patientID);
        }else{
            let buffer = fs.readFileSync("./sensorID.txt");
            this.patientID = buffer.toString();
        }
    }
}

class PatientData{

    constructor(id, body_temperature, blood_oxygen, heartRate, blood_pressure){
        this.patientID = id;
        this.bodyTemperature = body_temperature;
        this.bloodOxygen = blood_oxygen;
        this.heartRate = heartRate;
        this.bloodPressure = blood_pressure;
        this.isDoingExercise = false;
    }

    getRandomFloat(min, max, decimals) {
        const str = (Math.random() * (max - min) + min).toFixed(decimals);
      
        return parseFloat(str);
      } 

    run(){
        this.isDoingExercise = true;
        console.log("Started running");
        setTimeout(() => {
            this.rest();   
        }, 120000);
    }

    rest(){
        this.isDoingExercise = false;
        console.log("Finished running");
    }

    hypotermia(firstTime){
        this.bodyTemperature = this.getRandomFloat(25, 35, 1);
        if(!firstTime)
            return;
        setTimeout(() => {
            this.normalBodyTemperatureValue();   
        }, 11000);
    }

    normalBodyTemperatureValue(){
        this.bodyTemperature = this.getRandomFloat(35.5, 37, 1);
    }

    checkNormalBodyTemperatureValue(){
        return (this.bodyTemperature >= 35.5 && this.bodyTemperature <= 37);
    }

    normalHeartRateValue(){
        if(this.isDoingExercise){
            this.heartRate = this.getRandomFloat(100, 140, 0);
        }else{
            this.heartRate = this.getRandomFloat(60, 100, 0);
        }
    }

    checkNormalHeartRateValue(){
        if(this.isDoingExercise){
            return (this.heartRate >= 100 && this.heartRate <= 140);
        }else{
            return (this.heartRate >= 60 && this.heartRate < 100);
        }
    }

    normalOxygenValue(){
        this.bloodOxygen = this.getRandomFloat(86, 99, 0);
    }

    checkNormalOxygenValue(){
        return (this.bloodOxygen >= 86 && this.bloodOxygen <= 99);
    }

    normalPressureValue(age){
        if(!this.isDoingExercise){
            if(age < 10)
                this.bloodPressure = this.getRandomFloat(80, 110, 0);
            else
                this.bloodPressure = this.getRandomFloat(90, 120, 0);
        }else{
            if(age < 10)
                this.bloodPressure = this.getRandomFloat(100, 130, 0);
            else
                this.bloodPressure = this.getRandomFloat(110, 140, 0);
        }
    }

    checkNormalPressureValue(age){
        if(!this.isDoingExercise){
            if(age < 10)
                return (this.bloodPressure >= 80 && this.bloodPressure <= 110);
            else
                return (this.bloodPressure >= 90 && this.bloodPressure <= 120);
        }else{
            if(age < 10)
                return (this.bloodPressure >= 100 && this.bloodPressure <= 130);
            else
                return (this.bloodPressure >= 110 && this.bloodPressure <= 140);
        }
    }

    hypertension(age, firstTime){

        if(age < 10)
            return;

        if(!this.isDoingExercise){
            this.bloodPressure = this.getRandomFloat(140, 160, 0);
        }else{
            this.bloodPressure = this.getRandomFloat(160, 180, 0);
        }

        if(!firstTime)
            return;

        setTimeout(() => {
            this.normalPressureValue(age);   
        }, 30000);
    }

    hypoxia(firstTime){
        this.bloodOxygen = this.getRandomFloat(70, 85, 0);

        if(!firstTime)
            return;

        setTimeout(() => {
            this.normalOxygenValue();   
        }, 20000);
    }

    bradicardia(firstTime){
        this.heartRate = this.getRandomFloat(40, 60, 0);

        if(!firstTime)
            return;
        
        setTimeout(() => {
            this.normalHeartRateValue();   
        }, 17000);
    }

    tachycardia(firstTime){
        if(!this.isDoingExercise){
            this.heartRate = this.getRandomFloat(100, 150, 0);

            if(!firstTime)
                return;

            setTimeout(() => {
                this.normalHeartRateValue();   
            }, 8000);
        }
    }

    fever(age, firstTime){
        let min = 37.5;
        let max = 39;

        if(age > 10){
            min = 38;
            max = 40;
        }

        this.bodyTemperature = this.getRandomFloat(min, max, 1);

        if(!firstTime)
            return;
        
        setTimeout(() => {
            this.normalBodyTemperatureValue();   
        }, 60000);
    }

    publishData(){
        console.log(JSON.stringify(this));
        client.publish("/patientData/" + this.patientID, JSON.stringify(this));
    }
}

class Patient{

    constructor(bioData, patientData){
        this.bioData = bioData;
        this.patientData = patientData;
    }

    publishBioData(){
        let s = JSON.stringify(this.bioData);
        client.publish(patientDataTopic, s);
        setInterval(() => {

            // creating random probabilities thresholds for anomalies and for run
            let probTemp = Math.random() * 0.1;
            let probOxy = Math.random() * 0.1;
            let probRate = Math.random() * 0.1;
            let probPressure = Math.random() * 0.1;
            let probExercise = Math.random();
            
            // creating random numbers to establish if an anomaly
            // will occur
            let tempAnomaly = Math.random();
            let oxyAnomaly = Math.random();
            let rateAnomaly = Math.random();
            let pressureAnomaly = Math.random();
            let exercise = Math.random();

            // if the patient has a normal heart rate
            if(this.patientData.checkNormalHeartRateValue()){
                if(rateAnomaly <= probRate){ // an anomaly (like tachycardia) could occur
                    console.log("Starting tachycardia");
                    this.patientData.tachycardia(true);
                }else{
                    rateAnomaly = Math.random();
                    if(rateAnomaly <= probRate){ // or also bradicardia could occur
                        this.patientData.bradicardia(true);
                        console.log("Starting bradicardia");
                    }else{ // otherwise, it is normal
                        this.patientData.normalHeartRateValue();
                        console.log("HEART RATE NORMAL");
                    } 
                }
            }else if(this.patientData.heartRate >= 40 && this.patientData.heartRate <= 60){ // if it has bradicardia
                console.log("Keeping bradicardia"); // stick with bradicardia
                this.patientData.bradicardia(false);
            }else{ // if it has tachycardia
                console.log("Keeping tachycardia");
                this.patientData.tachycardia(false); // stick with tachycardia
            }
            
            // if the patient has a normal body temperature
            if(this.patientData.checkNormalBodyTemperatureValue()){
                if(tempAnomaly <= probTemp){ // an anomaly (like fever) could occur
                    console.log("Starting fever");
                    this.patientData.fever(this.bioData.age, true);
                }else{ // or also hypotermia could occur
                    tempAnomaly = Math.random();
                    if(tempAnomaly <= probTemp){
                        console.log("Starting hypotermia");
                        this.patientData.hypotermia(true);
                    }else{ // otherwise, it is normal
                        this.patientData.normalBodyTemperatureValue();
                        console.log("BODY TEMPERATURE NORMAL");
                    }  
                }
            }else if(this.patientData.bodyTemperature <= 35){ // if it has hypoyermia
                console.log("Keeping hypotermia");
                this.patientData.hypotermia(false); // stick with hypotermia
            }else{ // if it has fever
                console.log("Keeping fever");
                this.patientData.fever(this.bioData.age, false); // stick with fever
            }

            // if the patient has a normal blood oxygen
            if(this.patientData.checkNormalOxygenValue()){
                if(oxyAnomaly <= probOxy){ // an anomaly (like hypoxia) could occur
                    console.log("Starting hypoxia");
                    this.patientData.hypoxia(true);
                }else{ // otherwise, it is normal
                    this.patientData.normalOxygenValue();
                    console.log("BLOOD OXYGEN NORMAL");
                } 
            }else{ // if it has hypoxia
                console.log("Keeping hypoxia");
                this.patientData.hypoxia(false); // stick with hypoxia
            }   

            // if the patient has a normal blood pressure
            if(this.patientData.checkNormalPressureValue()){
                if(pressureAnomaly <= probPressure){ // an anomaly (like hypertension) could occur
                    console.log("Starting hypertension");
                    this.patientData.hypertension(this.bioData.age, true);
                }else{ // otherwise, it is normal
                    this.patientData.normalPressureValue(this.bioData.age);
                    console.log("BLOOD PRESSURE NORMAL");
                }
            }else{ // if it has hypertension
                console.log("Keeping hypertension");
                this.patientData.hypertension(this.bioData.age, false); // stick with that
            }

            // if the patient is not doing any exercise
            if(!this.isDoingExercise){
                if(exercise <= probExercise)
                    this.patientData.run(); // maybe it could start
            }
            
            this.patientData.publishData();
            //console.log("Published a new patient data record");
        }, 5000);
    }
}

let patientBioData = new PatientBioData("Deh", "Eagle 00", 23, "M");
let patientData = new PatientData(patientBioData.patientID, 36, 95, 95, 95);

let patient = new Patient(patientBioData, patientData);

 
let client = mqtt.connect('mqtt://212.78.1.205', settings);
let patientDataTopic = "/patientBioData/bio";

//patient.publishBioData();

client.on('connect',function(){
	console.log("Connected");
	patient.publishBioData();
});