let mqtt = require('mqtt');
const fs = require("fs");
 
let settings = {
	port: 1883,
	username: "studenti",
	password: "studentiDRUIDLAB_1"
};


class PatientBioData{

    constructor(name, surname, age, sex){
        this.id = "";
        this.name = name;
        this.surname = surname;
        this.age = age;
        this.sex = sex;
        this.fetchID();
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
            this.id = this.genRandomString(24);
            fs.writeFileSync("./sensorID.txt", this.id);
        }else{
            let buffer = fs.readFileSync("./sensorID.txt");
            this.id = buffer.toString();
            console.log("IoT " + this.id);
        }
    }
}

class PatientData{

    constructor(id, body_temperature, blood_oxygen, saturation, blood_pressure){
        this.id = id;
        this.bodyTemperature = body_temperature;
        this.bloodOxygen = blood_oxygen;
        this.saturation = saturation;
        this.bloodPressure = blood_pressure;
        this.isDoingExercise = false;
    }

    /**
     * Implement methods that correspond to anomalies (specific values under a certain threshold)
     */


    publishData(){
        client.publish("/patientData/" + this.id, JSON.stringify(this));
    }
}

function publishBioData(obj){
    let s = JSON.stringify(obj);
    client.publish(patientDataTopic, s);
    console.log("Published a new record");
    setInterval(() => {
        patientData.publishData();
        console.log("Published a new patient data record");
    }, 3000);
}

let patient = new PatientBioData("Valentino", "Rossi", 50, "M");
let patientData = new PatientData(patient.id, 36, 89, 95, 100); 

 
let client = mqtt.connect('mqtt://212.78.1.205', settings);
let patientDataTopic = "/patientBioData/bio";

client.on('connect',function(){
	console.log("Connected");
	publishBioData(patient);
});