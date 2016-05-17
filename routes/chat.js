
var connection = require('../db.js');

exports.showOldChat = function(req,res)
{
	var from = req.body.email;
	var to = req.body.to_email;

	q = 'select msg,time from chat where from_email = ? and to_email = ? ORDER BY id DESC limit 10' ;
	connection.query(q,[from,to],function(err,result)
	{
		if(err)
			console.log('err-------------',err);
		else
		{
			res.write(JSON.stringify(result));
			res.end();
		}


	})
}