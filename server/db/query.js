var conn;

exports.query = {
	bind : c => conn = c,
	execute: (statement, details, callback) => {
		if(details){
			conn.query(statement, details, (error, results, fields) => {
				callback(error, results, fields);
			});
		}else{
			conn.query(statement, (error, results, fields) => {
				callback(error, results, fields);
			});
		}
	},
};


