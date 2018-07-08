![Logo](admin/irrigation.png)
# ioBroker.irrigation
Dieser Adapter berechnet die Bewässerungszeiten Anhand einer theoretischen Verdunstungsrate. Die Verdunstungsrate steigt 
mit dem Quadart der Temperatur. 

Der Adapter unterstützt mehrere Bewässerungszonen und mehrere Bewässerungszeiten. Dabei ist wichtig, das die Bewässerungszeiten
für dem gesamten Adapter konfiguriert werden. Die Zone entscheidet, ob eine Bewässerung innerhalb der aktuellen Bewässerungszeit
notwendig ist.

## Bewässerungszeit (Zeitrahmen)

Die Anzahl der Bewässerungszeiten kann in der Adapterkonfiguration festgelegt werden. Für jede konfigurierte Zeit kann 
die Anfangs- und Endeminute festgelegt werden. Die Minutenangaben bezieht sich auf die Minute des Tages. 

Soll zwischen 8 Uhr morgens und 9 Uhr morgen überprüft werden, ob zu bewässern ist sind die Zeit wie folgt anzugeben:

* 8 * 60 = 480
* 9 * 60 = 540

### Bewässerungszeit (Zeitrahmen) - Verhalten

Bewässerungszeit bedeutet nicht, das nur in diesen Zeiten bewässert wird. In der Tat wird nur in dieser Zeiten überprüft,
ob die Bewässerung starten sollte. 

Im Detail: Eine Zone signalisiert ihre Ausführungsbereitschaft durch den Zustand ```isScheduled```. Diesen Zustand
ermittelt sie jede Minute. Der Adapter wechselt dann selbst in den Zustand ``isScheduled``. Dies ist eine berechnete 
Eigenschaft über alle Zonen. Sobald die Bewässerungszeit erreicht ist, wechselt der Adapter in den Zustand ```isRunning``` 
sofern ``isSchedules`` aktiv ist. 

**Wichtig**

``isRunning`` des Adapters ist nicht gleichbedeutend mit der tatsächlichen Bewässerung einer Zone. Der Adapter beginnt erst
mit der Bewässerung, wenn der Status ``isReady`` gesetzt wird. In diesem Fall wird jede Zone nacheinander abgearbeitet. Zonen
welche tatsächlich aktiv sind, erhaten den Status ``isRunning``. Es kann nicht vorkommen, das mehr als eine Zone diesen Status 
besitzt.

``isReady`` ist ein Synchronisationspunkt, welcher in der Regel von aussen gesetzt wird. Beispielsweise kann man diesen 
Zustand auf ``false`` setzen, wenn der Rasenmäher noch unterwegs ist oder wenn es regent. Wechselt der Status von``isReady``
während der Bewässerung auf ``false``, bricht der Adapter den aktuellen Vorgang ab.

## Bewässerungszonen

### Konfiguration einer Zone

Jede Bewässerungszone kann einzeln konfiguriert werden, um den örtlichen Gegebenheiten Rechnung zu tragen. Die Konfiguration 
wird im Datenpunkt ``settings`` vorgenommen.

#### ``settings.temperature``

``settings.temperature`` bezeichnet einen Refernenzwert. Auf dieser Basis wird die Verdunstungsrate (pro Minute) berechnet. Die 
Grundannahme ist, das die Bewässerung für diese Zone jeden Tag starten wird, sollte der Tagesdurchschnitt über diesem 
Werte liegen und nur ein Bewässerungszeit aller 24h konfiguriert sein.

#### ``settings.required``

Dieser Wert gibt an, bis zu welchem angenommen Wert die Bewässerung aktiv sein wird. Dieser Wert ist auch die Basis für
die Feuchtigkeitsberechnung.

#### ``settings.output``

Mit dieser Einstellung wird die Frage beantwortet, wie Leistungsfähig die Bewässerungsanlage in dieser Zone ist. Die
Angabe erfolgt in mm/min. Dieser Wert lässt sich beispielsweise durch eine einfache Messung ermitteln. Stellt ein Messglas
in die Zone und lasst diese eine Stunde bewässern. Die abgelesene Höhe teilt ihr durch 60 und tragt dann das Ergebnis für 
diese Zone ein.

#### ``settings.trigger``

HIer kann eingesellt werden ob diese Zone für dem erreichen eines Feuchtigkeitswerts von 0% diese Zone in den Status 
``isScheduled`` wechselt. Die Angabe erfogt in %.

### Eigenschaften einer Zone

#### Berechnete Eigenschaften

##### ``evapotranspiration``

Spiegelt die Verdunstungrate in der aktuellen Minute lt. Berechnung wider.

##### ``present``

Diese Eigenschaft wird auf Basis der Verdunstungsrate berechnet und nimmt jede Minute um die aktuelle Verdunstungsrate
ab, sofern nicht bewässert wird. Im Falle der aktiven Bewässerung nimmt diese Eigenschaft um den Wert ``settings.output`` 
pro Minute zu. Der Wert kann nicht unter 0 mm fallen und nicht größer als 15 mm werden.

#### Abgeleitete Eigenschaften

##### ``humidity``

Ist das Verhältnis aus `settings.required`` und ``present`` in %

##### ``isScheduled``

Diese Eigenschaft wird aktiv, wenn ``humidity`` unter den Schwellwert ``settings.trigger`` fällt.

##### ``minutes``

Bezeichnet die Laufzeit in Minuten in Abhängigkeit von ``present``, ``setttings.output`` und ``settings.required``. Damit
wird ausgedrückt, wie lang diese Zone bewässern wird, um den ``settings.required`` Wert zu erreichen.

#### Externe Eigenschaften

##### ``isRunning``

Wird vom Adapter gesetzt und signalisiert der Zone, das die Bewässerung starten soll.

##### ``temperature``

Wird vom Adapter oder einer anderen Quelle gesetzt und stellt die aktuelle Umgebungstemperatur der Zone dar. Auf Basis
dieses Wertes wird die aktuelle Verdunstungsrate berechnet.
 
## Changelog

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
