'use strict';

let http = require('http');// appelle de la fonction http de node js
let fs = require('fs');// appelle de la fonction fichier de node js sapplique a html css et autre
let url =require('url');
let gras = true;


let server = http.createServer(); //créer le serveur grace a la fonction http

let listeDeCourses = [];

server.on('request', function(request,response) {//contient tous se qui doit tourner sure le serveur

	let parsed = url.parse(request.url, true);

	var urlForm = /^\/([^\/]+)?$/;
	if (! urlForm.test(parsed.pathname)) {
		response.writeHead(404, {"content-type":"text/html;charset=utf-8"}); // definis une erreur 404
		response.end("Page inexistante");//message de page inexistante
		return;
	}


	let query = parsed.query;

	let sexe = query.sexe || "non";
	let name = decodeURI(parsed.pathname.slice(1)) || "nom inconu";

	fs.readFile('index5.html','utf-8',function(err,data){//indique le fichier que je veux appeller la en locurence index.html

		if(err) { // condition si la page nexiste pas

			response.writeHead(404, {"content-type":"text/html;charset=utf-8"}); // definis une erreur 404

			response.end("page inexistante");//message de page inexistante
			return;

		}

		response.writeHead(200, {"content-type":"text/html;charset=utf-8"});//fournit les information du type de contenue attendue  ainsi que si la page a etai correctement charger avec le coder erreur 200

		console.log("nouvelle requete");//console log basique
		//reponse.write() me permeterais de faire apparaitre du contenue en plus sans cloyurer le document
		if(sexe == "f"){

			data = data.replace('{{sexe}}','femme');

		}else if(sexe == "h"){

			data = data.replace('{{sexe}}','homme');

		}else{

			data = data.replace('{{sexe}}','indefini');

		}

		data = data.replace('{{name}}',name);


		data = data.replace('{{class}}', gras ? 'gras' : 'pas-gras');
		gras = ! gras;


		if(query.ajout !== ''){
			listeDeCourses.push(query.ajout);
			console.log(query.ajout)

		}
		let liste = '';
		listeDeCourses.forEach(function(ingredient) {
			liste += '<li>' + ingredient + '</li>';
		});
		//data = data.replace('{{i}}', i);
		data = data.replace('{{liste}}', liste);

		if (parsed.pathname === "/supprime"){
			let suppr = listeDeCourses.splice(listeDeCourses.indexOf(query.supprime),1);



		}



		response.end(data);// premet dafficher du contenue en fin de page
	});
});

server.listen(8080);


