const http = require('http');                    // 引入 http 模組
const { v4: uuidv4 } = require('uuid');          // 引入 uuid 模組
const errorHandle = require('./errorHandle');    // 引入 errorHandle 模組
const todos = [];

const requestListenter = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }


    let body = "";                                //接收資料
    req.on("data", (chunk) => {                  //資料接收中
        body += chunk;
    });

    if (req.url == "/todos" && req.method == "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();

    }
    else if (req.url == "/todos" && req.method == "POST") {
        req.on("end", () => {                                      //資料接收完畢
            try {
                const title = JSON.parse(body).title;              //取得title
                if (title !== undefined) {                           //判斷title是否為空
                    const todo = {                                 //建立todo物件
                        id: uuidv4(),
                        title: title
                    };
                    todos.push(todo);
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }
                else {
                    errorHandle(res);
                }

            }
            catch (error) {
                errorHandle(res);
            }

        })

    }
    else if (req.url == "/todos" && req.method == "DELETE") {   //針對網址發出的DELETE請求，所以不用接收資料
        todos.length = 0;                        //清空todos
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    }
    else if (req.url.startsWith("/todos/") && req.method == "DELETE") {       //針對特定網址發出的DELETE請求
        const id = req.url.split("/").pop();          //取得id
        const index = todos.findIndex(todo => todo.id == id);  //找到id的索引
        if (index !== -1) {                                //判斷是否有此id
            todos.splice(index, 1);                      //刪除
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
            res.end();
        }
        else {
            errorHandle(res);
        }

    }
    else if (req.url.startsWith("/todos/") && req.method == "PATCH") {        //針對單一網址發出的PATCH請求(修改)        

        req.on("end", () => {                                      //資料接收完畢
            try {
                const id = req.url.split("/").pop();          //取得id
                const index = todos.findIndex(todo => todo.id == id);  //找到id的索引
                if (index !== -1) {                                //判斷是否有此id
                    const title = JSON.parse(body).title;              //取得title
                    if (title !== undefined) {                           //判斷title是否為空
                        todos[index].title = title;                     //修改title
                        res.writeHead(200, headers);
                        res.write(JSON.stringify({
                            "status": "success",
                            "data": todos,
                        }));
                        res.end();
                    }
                    else {
                        errorHandle(res);
                    }
                }
                else {
                    errorHandle(res);
                }

            }
            catch (error) {
                errorHandle(res);
            }

        })


    }
    else if (req.method == "OPTIONS") {           //處理跨域
        res.writeHead(200, headers);
        res.end();
    }
    else {                                      //無此路由
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此路由",
        }));
        res.end();
    }

}

const server = http.createServer(requestListenter);
server.listen(process.env.PORT || 3005);

