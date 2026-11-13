// Plurals for the nouns in words.js. First entry = shown answer, others also accepted.
// Nouns not listed have no usable plural (Hunger, Reis, Geld, …) and skip the plural step.
// Checked against Duden: Urlaub, Balkon, Konto, Bier (left out), Wort. The rest are from my own knowledge of standard plurals.
(function (root) {
  const P = {
    Bahnhof:["Bahnhöfe"],Flughafen:["Flughäfen"],Zug:["Züge"],Bus:["Busse"],Schlüssel:["Schlüssel"],Tisch:["Tische"],Stuhl:["Stühle"],Schrank:["Schränke"],
    Computer:["Computer"],Kuchen:["Kuchen"],Käse:["Käse"],Apfel:["Äpfel"],Salat:["Salate"],Kaffee:["Kaffees"],Tee:["Tees"],Saft:["Säfte"],Fisch:["Fische"],
    Mann:["Männer"],Freund:["Freunde"],Bruder:["Brüder"],Sohn:["Söhne"],Vater:["Väter"],Onkel:["Onkel"],Lehrer:["Lehrer"],Arzt:["Ärzte"],Kollege:["Kollegen"],
    Nachbar:["Nachbarn"],Gast:["Gäste"],Chef:["Chefs"],Tag:["Tage"],Montag:["Montage"],Morgen:["Morgen"],Abend:["Abende"],Monat:["Monate"],Urlaub:["Urlaube"],
    Termin:["Termine"],Brief:["Briefe"],Koffer:["Koffer"],Rucksack:["Rucksäcke"],Regenschirm:["Regenschirme"],Mantel:["Mäntel"],Pullover:["Pullover"],Schuh:["Schuhe"],
    Hut:["Hüte"],Garten:["Gärten"],Park:["Parks"],Platz:["Plätze"],Weg:["Wege"],Fluss:["Flüsse"],Berg:["Berge"],See:["Seen"],Wald:["Wälder"],Strand:["Strände"],
    Hund:["Hunde"],Vogel:["Vögel"],Baum:["Bäume"],Film:["Filme"],Preis:["Preise"],Beruf:["Berufe"],Kurs:["Kurse"],Ausweis:["Ausweise"],Bleistift:["Bleistifte"],
    Kugelschreiber:["Kugelschreiber"],Spiegel:["Spiegel"],Teppich:["Teppiche"],Balkon:["Balkons","Balkone"],Keller:["Keller"],Fahrplan:["Fahrpläne"],Stadtplan:["Stadtpläne"],
    Fernseher:["Fernseher"],Kühlschrank:["Kühlschränke"],Supermarkt:["Supermärkte"],Markt:["Märkte"],Kopf:["Köpfe"],Arm:["Arme"],Finger:["Finger"],Fuß:["Füße"],
    Rücken:["Rücken"],Bauch:["Bäuche"],Zahn:["Zähne"],Bäcker:["Bäcker"],
    Frau:["Frauen"],Tochter:["Töchter"],Mutter:["Mütter"],Schwester:["Schwestern"],Freundin:["Freundinnen"],Lehrerin:["Lehrerinnen"],Ärztin:["Ärztinnen"],Familie:["Familien"],
    Wohnung:["Wohnungen"],Küche:["Küchen"],Tür:["Türen"],Straße:["Straßen"],Stadt:["Städte"],Woche:["Wochen"],Uhr:["Uhren"],Zeit:["Zeiten"],Stunde:["Stunden"],
    Minute:["Minuten"],Nacht:["Nächte"],Sonne:["Sonnen"],Katze:["Katzen"],Blume:["Blumen"],Tasche:["Taschen"],Brille:["Brillen"],Hose:["Hosen"],Jacke:["Jacken"],
    Schule:["Schulen"],Universität:["Universitäten"],Arbeit:["Arbeiten"],Firma:["Firmen"],Bank:["Banken"],Apotheke:["Apotheken"],Bäckerei:["Bäckereien"],Kirche:["Kirchen"],
    Brücke:["Brücken"],Haltestelle:["Haltestellen"],Fahrkarte:["Fahrkarten"],Reise:["Reisen"],Karte:["Karten"],Zeitung:["Zeitungen"],Zahl:["Zahlen"],Nummer:["Nummern"],
    Frage:["Fragen"],Antwort:["Antworten"],Aufgabe:["Aufgaben"],Übung:["Übungen"],Sprache:["Sprachen"],Prüfung:["Prüfungen"],Stimme:["Stimmen"],Hand:["Hände"],Nase:["Nasen"],
    Idee:["Ideen"],Farbe:["Farben"],Suppe:["Suppen"],Tomate:["Tomaten"],Banane:["Bananen"],Kartoffel:["Kartoffeln"],Flasche:["Flaschen"],Tasse:["Tassen"],Gabel:["Gabeln"],
    Lampe:["Lampen"],Wand:["Wände"],Treppe:["Treppen"],Heizung:["Heizungen"],Rechnung:["Rechnungen"],Speisekarte:["Speisekarten"],Miete:["Mieten"],Kreditkarte:["Kreditkarten"],
    Haus:["Häuser"],Zimmer:["Zimmer"],Bad:["Bäder"],Bett:["Betten"],Fenster:["Fenster"],Auto:["Autos"],Fahrrad:["Fahrräder"],Handy:["Handys"],Buch:["Bücher"],Heft:["Hefte"],
    Papier:["Papiere"],Brot:["Brote"],Ei:["Eier"],Essen:["Essen"],Frühstück:["Frühstücke"],Mittagessen:["Mittagessen"],Abendessen:["Abendessen"],Restaurant:["Restaurants"],
    Café:["Cafés"],Hotel:["Hotels"],Kino:["Kinos"],Theater:["Theater"],Museum:["Museen"],Krankenhaus:["Krankenhäuser"],Büro:["Büros"],Geschäft:["Geschäfte"],Kind:["Kinder"],
    Baby:["Babys","Babies"],Mädchen:["Mädchen"],Jahr:["Jahre"],Foto:["Fotos"],Bild:["Bilder"],Spiel:["Spiele"],Lied:["Lieder"],Wort:["Wörter","Worte"],Problem:["Probleme"],
    Thema:["Themen"],Ergebnis:["Ergebnisse"],Ticket:["Tickets"],Flugzeug:["Flugzeuge"],Schiff:["Schiffe"],Gleis:["Gleise"],Ziel:["Ziele"],Land:["Länder"],Dorf:["Dörfer"],
    Meer:["Meere"],Tier:["Tiere"],Pferd:["Pferde"],Gesicht:["Gesichter"],Auge:["Augen"],Ohr:["Ohren"],Bein:["Beine"],Knie:["Knie"],Herz:["Herzen"],Hemd:["Hemden"],
    Kleid:["Kleider"],Regal:["Regale"],Sofa:["Sofas"],Licht:["Lichter"],Messer:["Messer"],Glas:["Gläser"],Konto:["Konten","Kontos"],Telefon:["Telefone"],Datum:["Daten"],
    Leben:["Leben"],Gebäude:["Gebäude"],Stück:["Stücke"]
  };
  if (typeof module !== "undefined") module.exports = P; else root.PLURALS = P;
})(this);
