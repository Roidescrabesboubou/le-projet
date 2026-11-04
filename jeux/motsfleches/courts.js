/* ============================================================
   MOTS FLÉCHÉS : mots de deux lettres, très utiles pour remplir
   Les mots plus longs viennent du dictionnaire des Mots croisés.
   Une ligne par mot : MOT|Définition courte
   ============================================================ */
window.MF_COURTS = `
AH|Cri d'étonnement
AI|Paresseux d'Amérique
AS|Champion
BD|Astérix ou Tintin
BU|Avalé
CA|Cela, en bref
CE|Pronom démonstratif
DE|Cube à six faces
DJ|Il mixe en soirée
DO|Première note
DU|Article contracté
EN|Préposition de lieu
ET|Mot de liaison
EX|Ancien amoureux
FA|Note avant sol
GO|Jeu de pions japonais
IF|Conifère
IL|Pronom masculin
KO|Hors de combat
LA|Note du diapason
LE|Article masculin
LU|Parcouru des yeux
MA|À moi, au féminin
ME|Pronom personnel
MI|Note après ré
NE|Venu au monde
NI|Conjonction négative
NO|Théâtre japonais
NU|Sans vêtement
OH|Cri de surprise
OK|D'accord
ON|Pronom indéfini
OR|Métal précieux
OS|Pièce du squelette
OU|Conjonction de choix
PC|Ordinateur
PI|Vaut environ 3,14
QI|Mesure d'intelligence
RA|Dieu solaire égyptien
RE|Note après do
RU|Petit ruisseau
SA|À lui, au féminin
SE|Pronom réfléchi
SI|Note avant do
SU|Appris
TA|À toi, au féminin
TE|Pronom personnel
TU|Pronom familier
TV|Petit écran
UN|Premier nombre
US|Coutumes
UT|Ancien nom du do
VO|Version originale
VU|Aperçu
WC|Petit coin
`.trim().split("\n").map(l=>{const[mot,def]=l.split("|");return{mot,def}});
