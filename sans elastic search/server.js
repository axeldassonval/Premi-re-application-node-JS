let http = require('http') // appelle de la fonction http de node js
let fs = require('fs') // appelle de la fonction fichier de node js sapplique a html css et autre
let url =require('url')

let server = http.createServer() //créer le serveur grace a la fonction http

server.on('request', function(request,response) {//contient tous se qui doit tourner sure le serveur
	let query = url.parse(request.url, true).query
	let name = (query.name === undefined) ? "inconu" : query.name

	fs.readFile('index.html','utf-8',function(err,data){//indique le fichier que je veux appeller la en locurence index.html
		if(err) { // condition si la page nexiste pas
			response.writeHead(404, {"content-type":"text/html;charset=utf-8"}) // definis une erreur 404
			response.end("page inexistante")//message de page inexistante
		}else{
			response.writeHead(200, {"content-type":"text/html;charset=utf-8"})//fournit les information du type de contenue attendue  ainsi que si la page a etai correctement charger avec le coder erreur 200

			console.log("nouvelle requete")//console log basique
			//reponse.write() me permeterais de faire apparaitre du contenue en plus sans cloyurer le document
			data = data.replace('{{name}}',name) // permet de remplacer {{name}} dans mon docc html
			response.end(data)// premet dafficher du contenue en fin de page
		}

	})


})

server.listen(8080)
