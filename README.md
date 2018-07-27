![Logo](admin/irrigation.png)
# ioBroker.irrigation
Dieser Adapter berechnet die Bewässerungszeiten Anhand einer theoretischen Verdunstungsrate. Die Verdunstungsrate steigt 
linear mit der aktuellen Temperatur. 

Der Adapter unterstützt mehrere Bewässerungszonen und mehrere Bewässerungszeiten. Dabei ist wichtig, das die Bewässerungszeiten
für dem gesamten Adapter konfiguriert werden. Die Zone entscheidet, ob eine Bewässerung innerhalb der aktuellen Bewässerungszeit
notwendig ist.

## Bewässerungszeit (Zeitrahmen)
Die Anzahl der Bewässerungszeiten kann in der Adapterkonfiguration festgelegt werden. Für jede konfigurierte Zeit kann 
die Anfangs- und Endeminute festgelegt werden. Die Minutenangaben bezieht sich auf die Minute des Tages. 

Soll zwischen 8 Uhr morgens und 9 Uhr morgen überprüft werden, ob zu bewässern ist sind die Zeit wie folgt anzugeben:

* 8 * 60 = 480
* 9 * 60 = 540

## Bewässerungszeit (Zeitrahmen) - Verhalten
Bewässerungszeit sind nur Überprüfungspunkte ob eine Zone starten soll. Die tatsächliche Bewässerungszeit 
kann weit über den ``end`` Wert reichen. 

**Im Detail**

Eine Zone signalisiert ihre Ausführungsbereitschaft durch den Zustand ```isScheduled```. Diesen Zustand
ermittelt sie jede Minute. Der Adapter wechselt dann selbst in den Zustand ``isScheduled``. Dies ist eine berechnete 
Eigenschaft über alle Zonen. Sobald die Bewässerungszeit erreicht ist, wechselt der Adapter in den Zustand ```isRunning``` 
sofern ``isSchedules`` aktiv ist. Sind alle anderen Randbedinungen erfüllt wird jede Zone, welche bewässern möchte,
dies bis zur Erfüllung ihrer Aufgabe tun.

Ist der Zeitramen bis 20 Uhr und 19:55 entscheidet eine Zone, dass sie bewässern möchte, wird diese gestartet. Die Zone
selbst hat die Hoheit darüber wie lang sie dies tut. Sie kann auch bis 23 Uhr ihren Dienst verrichte, um die Aufgabeb zu
erfüllen. Entscheidet eine Zone 20:05, dass es Zeit wäre, muss diese sich bis um nächsten Zeitfenster gedulden.
 
**Wichtig**

``isRunning`` des Adapters ist nicht gleichbedeutend mit der tatsächlichen Bewässerung einer Zone. Der Adapter beginnt erst
mit der Bewässerung, wenn der Status ``isReady`` gesetzt wird. In diesem Fall wird jede Zone nacheinander abgearbeitet. Zonen
welche tatsächlich aktiv sind, erhaten den Status ``isRunning``. Es kann nicht vorkommen, dass mehr als eine Zone diesen Status 
besitzt.

``isReady`` ist ein Synchronisationspunkt, welcher in der Regel von aussen gesetzt wird. Beispielsweise kann man diesen 
Zustand auf ``false`` setzen, wenn der Rasenmäher noch unterwegs ist oder wenn es regent. Wechselt der Status von``isReady``
während der Bewässerung auf ``false``, bricht der Adapter den aktuellen Vorgang ab.

## Steuerung des Adapters
Kommt noch

## Konfiguration einer Zone
Jede Bewässerungszone kann einzeln konfiguriert werden, um den örtlichen Gegebenheiten Rechnung zu tragen. Die Konfiguration 
wird im Datenpunkt ``settings`` vorgenommen.

### settings.temperature
``settings.temperature`` bezeichnet einen Refernenzwert. Auf dieser Basis wird die Verdunstungsrate (pro Minute) berechnet. Die 
Grundannahme ist, dass die Bewässerung für diese Zone jeden Tag starten wird, sollte der Tagesdurchschnitt über diesem 
Werte liegen und nur ein Bewässerungszeit aller 24h konfiguriert sein.

### settings.required
Dieser Wert gibt an, bis zu welchem angenommen Wert die Bewässerung aktiv sein wird. Dieser Wert ist auch die Basis für
die Feuchtigkeitsberechnung.

### settings.output
Mit dieser Einstellung wird die Frage beantwortet, wie Leistungsfähig die Bewässerungsanlage in dieser Zone ist. Die
Angabe erfolgt in mm/min. Dieser Wert lässt sich beispielsweise durch eine einfache Messung ermitteln. Stellt ein Messglas
in die Zone und lasst diese eine Stunde bewässern. Die abgelesene Höhe teilt ihr durch 60 und tragt dann das Ergebnis für 
diese Zone ein.

### settings.trigger
Hier kann eingesellt werden ob diese Zone vor dem erreichen eines Feuchtigkeitswerts von 0% diese Zone in den Status 
``isScheduled`` wechselt. Die Angabe erfogt in %.

### settings.isAutomatic
Diese Eigenschaft wird über den Adapter gesteuert, kann aber auch einzeln gesetzt werden. Ist der Automatikmodus
deaktiviert, wird die Verdungstungsrate weiterhin berechnet aber diese Zone nimmt nicht an der *automatischen* 
Bewässerung teil und muss von Hand gestartet werden.

## Berechnete Eigenschaften einer Zone

### evapotranspiration
Spiegelt die Verdunstungrate in der aktuellen Minute lt. Berechnung wider.

### present
Diese Eigenschaft wird auf Basis der Verdunstungsrate berechnet und nimmt jede Minute um die aktuelle Verdunstungsrate
ab, sofern nicht bewässert wird. Im Falle der aktiven Bewässerung nimmt diese Eigenschaft um den Wert ``settings.output`` 
pro Minute zu. Der Wert kann nicht unter 0 mm fallen und nicht größer als 15 mm werden.

## Abgeleitete Eigenschaften einer Zone
### humidity
Ist das Verhältnis aus ``settings.required`` und ``present`` in %

### isScheduled
Diese Eigenschaft wird aktiv, wenn ``humidity`` unter den Schwellwert ``settings.trigger`` fällt.

### minutes
Bezeichnet die Laufzeit in Minuten in Abhängigkeit von ``present``, ``setttings.output`` und ``settings.required``. Damit
wird ausgedrückt, wie lang diese Zone bewässern wird, um den ``settings.required`` Wert zu erreichen.

## Externe Eigenschaften einer Zone
### isRunning
Wird vom Adapter gesetzt und signalisiert der Zone, dass die Bewässerung starten oder stopen soll.

### temperature
Wird vom Adapter oder einer anderen Quelle gesetzt und stellt die aktuelle Umgebungstemperatur der Zone dar. Auf Basis
dieses Wertes wird die aktuelle Verdunstungsrate berechnet.

## Abgrenzung
In der aktullen Version steuert diese Adapter keine Geräte/externen Zustände. Dies ist für die Zukunft geplant aber noch
nicht implementiert. Die ``isReady`` Eigenschaft muss von außen gesetzt werden.

## Aktuelle Szenarien und deren Steuerung.
Ich verwende den Javascript Adapter um auf das Ereignis ``isRunning`` einer Zone zu reagieren und schalte damit die
entsprechenden Ventile. Den Javascript Adapter verwende ich auch, um den ``isReady`` Zustand zu steuern. Signalisieren meine Sensoren das es regnet
oder ist mein Rasenmäher unterwegs, schalte ich diesen Zustand entsprechend.

Meine Rasenmähersteuerung reagiert auf die Zustandsänderung ``isRunning`` des *Irrigation Adapters* und bricht das mähen
ab. Sobald er seine Station erreicht hat, schaltet er den Zustand ``isReady`` und die Bewässerung beginnt.

Der ``isReady`` Zustand kännte auch für einen Party-Modus verwendet werden. Wer möchte schon im Regen stehen, wenn man 
eigentlich grillen will. :)

## Changelog
### 0.2.2 (2018-07-27)
* Das löschen alter Zustände, welche nicht mehr existieren, erzegut keine Warnung mehr

### 0.2.1 (2018-07-26)
* Rekursion ohne Abbbruchbedingung entfernt

### 0.2.0 (2018-07-26)
* Status mit falscher benahmung geändert
* Einführung einer Sensor-Gruppe um die Status besser abzubilden.
* Der Adapter selbst enthätl keine Sensorwerte mehr. Skripte müssen nun die Sensorwerte der jeweiligen Zone setzen.
* Die lineare Verdunstungsberechnung wurde durch die Haude-Formel ersetzt, diese Berücksichtig nun auch die relative Fechtigkeit
* [Geplant] Die Algorithmen zur Verdunstungsbrechnung sollen konfigurierbar werden.

### 0.1.6 (2018-07-24)
* Die Verdunstungsrate ist nun linear zur aktuellen Temperatur
* Settingswerte werden nach der Aktualisierung des Adapters nicht mehr überschrieben.

### 0.1.5 (2018-07-14)
* Dokumentation erweitert

### 0.1.4 (2018-07-14)
* Aussaatmodus wieder entfernt. Die Erhöhung von ``settings.trigger`` erfüllt den gleichen Zweck
* Bug in der Behandlung des Niederschlags gefixt. Der Wert kann nun nicht mehr ``null`` werden.

### 0.1.3 (2018-07-14)
* Dokumentation erweitert

### 0.1.2 (2018-07-14)
* Während der Saatzeit wird die Bewässerung bei einer Feuchtigkeit kleiner als 90% starten
 
### 0.1.1 (2018-07-14)
* Behandlung von Initialwerten verbessert 

### 0.1.0 (2018-07-14)
* Aussaatmodus verbessert 

### 0.0.6 (2018-07-14)
* Aussaatmodus hinzugefügt 

### 0.0.5 (2018-07-14)
* Der Niederschlag wird nicht mehr von der Feuchtigkeit einer Zone abgezogen sondern korrekterweise erhöht der 
Niederschlag die vorhandene Bodenfeuchtigkeit. 

### 0.0.4 (2018-07-14)
* Bedingungen wann der Adapter eine Zone startet wurden gehändert

### 0.0.3 (2018-07-14)
* Die vorhandenen Feuchtigkeit kann nicht mehr größer als 15 mm werden

### 0.0.2 (2018-07-14)
* Status zur Niederschlagserfassung hinzugefügt

### 0.0.1 (2018-07-14)
* Initiale Version

## License
The MIT License (MIT)

Copyright (c) 2018 Wilko Waitz <info@waitz.biz>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
