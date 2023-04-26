const express=require('express'); // import express module  // install express
const app=express(); // call the express function 
const bodyparser=require('body-parser');  // install np i body-parser information are stored json doc so we use body parser easy to get the value
const exhbs=require('express-handlebars')   // we use express template named as handlebars   npm i express-handlebars
const handlebars=exhbs.create({extname:".hbs"});  // we create file for exbhs template engine thats file extension is .hbs
app.use(bodyparser.urlencoded({extended:true}))  // a built-in middleware function in Express. It parses incoming requests with URL-encoded payloads and is based on a body parser.
app.engine('hbs',handlebars.engine); // it is used for render so we use engine hbs is a parameter 
app.set("view engine","hbs"); //set the template engine we already define hbs so we use here
app.use(express.static('public'))   //we dont give public/image/name.jpg we can use /image/name.jpg

const mysql=require('mysql')   // import mysql database npm i mysql open cmd or workbench create database
//-------------------mysql connection  -----------------------------------------
const con=mysql.createPool({  // create pool is a function 
    host:'127.0.0.1',
    user:'root', 
    port:'3306',   // these are the details are in  mysql workbench  connection details 
    password:'vennila',
    database:'bloodgroup'
})


app.get('/',(req,res)=>{     // if root page means it will show below details
// console.log("ok")
res.render('index');  // render is used to take value from index file  use index file
})

//------------------------- show tables ----------------------------------------
app.get('/hospital',(req,res)=>{
    let name=req.query.name;
    let hos=`${name} HOSPITAL`;
    con.getConnection((err,connection)=>{
        if(err)throw err;
        else{
           connection.query(`select * from ${name}`,(err,rows)=>{
               connection.release();
                if(err)throw err;
                else{
                    res.render('Blood',{rows,hos});
                    
                }
               })
           }
       })
})
     //---------------------admin page-----------------------------

    app.get('/admin',(req,res)=>{     // if root page means it will show below details
        // console.log("ok")
        console.log(req.body.hospitalname);
        res.render('form');  // render is used to take value from index file  use index file
        })

        //--------------------after form submission---------------------------
    app.use('/edit',(req,res)=>{
        let hosname;
        if(req.query.hospital)
        {
            hosname=req.query.hospital;
        }
        else
        {
            hosname=req.body.hospitalname;
        }
        pass=req.body.password;
        
            con.getConnection((err,connection)=>{
            if(err)throw err;
            else{
                
                    connection.query(`select * from ${hosname}`,(err,overall)=>{
                        if(err)throw err;
                        else{
                            connection.query(`select * from ordertable where hospitalname='${hosname}'`,(err,orders)=>{  // select orders
                                connection.release();
                                 if(err)throw err;
                                 else{
                                     
                                     res.render('admin',{overall,hosname,orders});
                                 }
                             }) 
                        }
                    })  }   
        })
    
    })

   
    //------------------------- crud edit --------------------------------

    //  UPDATE ---------------------------

    app.get('/editdetails',(req,res)=>{
        let id=req.query.id;
        let hos=req.query.hospital;
        con.getConnection((err,connection)=>{
            if(err)
            throw err;
            connection.query(`select * from ${hos} where ID=?`,[id],(err,rows)=>{ // it will give the value where we touch
                connection.release();
                if(err)
                throw err;
                else
                res.render('edituser',{rows,hos});  //go to edituser. hbs
            })
        })
    
    })
    
    //-------------------------update values in mysql -----------------------------------------
    
    app.post('/edituser',(req,res)=>{
        let hos=req.query.hospital;
        let id=req.query.id;
        let blood=req.body.blood;
        let quann=req.body.liter;
        con.getConnection((err,connection)=>{
            if(err)throw err;
            connection.query(`update ${hos} set quantity=${quann} where id='${id}'`,(err,rows)=>{
                 if(err)
                 throw err;
                  else res.redirect(`/edit/?hospital=${hos}`);
              })
             
          })
     })
    

    //----------------------------delete bloods-----------------------
    app.get('/deletedetails',(req,res)=>{
        let id=req.query.id;
        let hos=req.query.hospital;
          con.getConnection((err,connection)=>{
            if(err)throw err;
            connection.query(`delete from ${hos} where id=?`,[id],(err,rows)=>{
                 if(err)
                 throw err;
                  else res.redirect(`/edit/?hospital=${hos}`);
              })
             
          })
     })
//-----------------------ADD NEW BLOODS------------------------------
app.get('/adduser',(req,res)=>
{ let hos=req.query.hospital;
        res.render('adduser');
})
app.post('/adduser',(req,res)=>{
    let id=req.body.id;
    let hos=req.body.hosp;
    let blood=req.body.blood;
    let quann=req.body.liter;
    con.getConnection((err,connection)=>
    {
       if(err)
       throw err;
       connection.query(`insert into ${hos}(ID,BLOOD,QUANTITY) values(?,?,?)`,[id,blood,quann],(err,rows)=>{
        connection.release();
        if(err)
        throw err;
        else{
            res.redirect(`/hospital/?name=${hos}`);
        }
       })
    })
})

// ---------------------------book orders------------------------------//
app.get('/book',(req,res)=>{
            res.render('book')
        })

 app.post('/book',(req,res)=>{ 
    let name=req.body.name;
    let quann=req.body.liter;
   let hospital =req.body.hos;
   let blood=req.body.bloo;
     let contact=req.body.call;
//    let order=`ordered person name:${name},bloodgroup:${blood},quantity:${quann} litre,contact:${contact}`;
//    console.log(hospital);
   con.getConnection((err,connection)=>{
    if(err) throw err;
    else{
            connection.query(`insert into ordertable(name,hospitalname,bloodgroup,quantity,contact) values('${name}','${hospital}','${blood}','${quann}','${contact}')`,(err,rows)=>{
            if(err) throw err;
            else
           {
            connection.query(`select QUANTITY from ${hospital} where BLOOD=?`,[blood],(err,rows)=>{
                if(err) throw err;
                else{
                let up=(rows[0].QUANTITY)-quann;
                  connection.query(`update ${hospital} set QUANTITY=? where blood=?`,[up,blood],(err,rows)=>{
                    connection.release();
                    if(err)
                    throw err;
                    else
                   res.render('index');
                
                })
            
                }
                })
           }
        })
    }
   })
 })
//--------------------------if blood is deliverd we can remove ---------------------
        app.get('/deleteorder',(req,res)=>{
            let id=req.query.id;
            console.log(id);
            let hos=req.query.hospital;
            console.log(hos);
              con.getConnection((err,connection)=>{
                if(err)throw err;
                connection.query(`delete from ordertable where id=?`,[id],(err,rows)=>{
                     if(err)
                     throw err;
                      else res.redirect(`/edit/?hospital=${hos}`);
                  })
                 
              })
         }) 
        app.listen(4001);