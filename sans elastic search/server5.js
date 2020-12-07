'use strict';

let http = require('http');// appelle de la fonction http de node js
let fs = require('fs');// appelle de la fonction fichier de node js sapplique a html css et autre
let url =require('url');
let gras = true;


let server = http.createServer(); //créer le serveur grace a la fonction http

let listeDeCourses = [];

server.on('request', function(request,response) {//contient tous se qui doit tourner sure le serveur

	let parsed = url.parse(request.url, true);

	if (parsed.pathname !== '/' ) {
		response.writeHead(404, {"content-type":"text/html;charset=utf-8"}); // definis une erreur 404
		response.end("Page inexistante");//message de page inexistante
		return;
	}


	let query = parsed.query;

	let sexe = (query.sexe === undefined) ? "non" : query.sexe; //premet de definir le sexe entrer par l'utilisateur

	let name = (query.name === undefined) ? "nom inconu" : query.name;//defini le nom rentrer

	fs.readFile('index5.html','utf-8',function(err,data){//indique le fichier que je veux appeller la en locurence index.html

		if(err) { // condition si la page nexiste pas

			response.writeHead(404, {"content-type":"text/html;charset=utf-8"}); // definis une erreur 404

			response.end("page inexistante");//message de page inexistante
			return;

		}

		response.writeHead(200, {"content-type":"text/html;charset=utf-8"});//fournit les information du type de contenue attendue  ainsi que si la page a etai correctement charger avec le coder erreur 200

		console.log("nouvelle requete");//console log basique
		//reponse.write() me permeterais de faire apparaitre du contenue en plus sans cloyurer le document
		if(sexe == "f"){ //ma condition pour changer la couleur via le css

			data = data.replace('{{sexe}}','femme');

		}else if(sexe == "h"){//ma condition pour changer la couleur via le css

			data = data.replace('{{sexe}}','homme');

		}else{//ma condition pour changer la couleur via le css

			data = data.replace('{{sexe}}','indefini');

		}

		data = data.replace('{{name}}',name);//me premet de faire apparaitre le nom entrer part l'utilisateur sure la page html


		data = data.replace('{{class}}', gras ? 'gras' : 'pas-gras'); //condition pour passer le paragraphe en gras ou non
		gras = ! gras; // permet d'inverser gras pas gras


		//ajout a la liste
		if(query.ajout !== '' && query.ajout !== undefined){ //mes condition pour eviter les blanc ou undefined dans la liste
			listeDeCourses.push(query.ajout);//permet l'ajout a la liste
			console.log(query.ajout)//voire se que jai ajouter dans la console

		}
		if (listeDeCourses.indexOf(query.supprime) !== -1){ // condition pour suprimer si diferent de -1
			let suppr = listeDeCourses.splice(listeDeCourses.indexOf(query.supprime),1);//vriable pour verifeir la presence du mot dans le tableau et le suprimer si oui
		}
		let liste = '';
		listeDeCourses.forEach(function(ingredient) {//parcour mon tableau pour afficher la liste
			liste += '<li>' + ingredient + '<button id="suppr" name="supprime" value="' + ingredient + '">x</button></li>'; // aspect visuelle de ma liste
		});
		//data = data.replace('{{i}}', i);
		data = data.replace('{{liste}}', liste); // remplace dans mon html {{liste}}prat les mot entrer




		response.end(data);// premet dafficher du contenue en fin de page
	});
});

server.listen(8080); // port d'ecoute du serveur


