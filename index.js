const fs = require ('fs')
const express = require ('express');
const {Router} = express;
const multer = require ('multer');
const port = 8080;

//Routers
const app = express();
const urlProductos = Router ();

//Midlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Rutas customizadas
app.use ('/api/productos', urlProductos);
app.use ('/api/formProductos', express.static('public'));

//SETEANDO MULTER
const storage = multer.diskStorage ({
    destination: function (req, file, cb) {
        cb (null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb (null, file.fieldname)
    }
})

const fileMiddleware = multer ({storage:storage});

urlProductos.get ('/', (req, res) => {
    async function getAll () {
        try{
            let infoTxt = await fs.promises.readFile ('./productos.txt', 'utf-8');
            let infoToObj = JSON.parse (infoTxt);
            res.json(infoToObj)
        } catch (err) {
            console.log('No se pudo ejecutar GETALL ()')
        }
    }
    getAll()
})

urlProductos.get ('/:id', (req, res) => {
    let productoId = JSON.parse(req.params.id);
    async function getProductById () {
        try {
            let infotxt = await fs.promises.readFile ('./productos.txt', 'utf-8');
            let infoToObj = JSON.parse (infotxt);
            let productoPorId = infoToObj.filter (prod => prod.id == productoId);
            res.json (productoPorId[0])
            
        } catch (err) {
            console.log('No se pudo ejecutar getProductByID ()');
        }
    } 
    getProductById ();
})

urlProductos.post ('/', fileMiddleware.single ('imagen') ,(req, res) => {
    let newProducto = {
        nombre: req.body.nombre,
        precio: req.body.precio,
        imagen: req.file
    }

    async function guardarProducto () {
        try {
            let infoTxt = await fs.promises.readFile ('./productos.txt', 'utf-8');
            let infoToObj = JSON.parse (infoTxt);
            let idObjeto = infoToObj.length + 1;
            let newObj = {...newProducto, id: idObjeto}
            infoToObj.push (newObj);
            let infoToTxt = JSON.stringify (infoToObj, null, 2);
            fs.writeFile ('./productos.txt', infoToTxt, error => {
                if (error) {
                    console.log ('No se pudo escribir el archivo en guardarProducto()');
                }
                else {
                    console.log ('se escribió el archivo correctamente');
                }
            })
            res.json (infoToObj);

        } catch (err) {
            console.log ('No se pudo ejecutar guardarProducto ()');
        }
    }
    guardarProducto()

    
})

urlProductos.put ('/:id', (req, res) => {
    let idProducto = req.params.id;
    async function actualizarProducto () {
        try {
            let infoToTxt = await fs.promises.readFile ('./productos.txt', 'utf-8');
            let infoToObj = JSON.parse (infoToTxt);
            if (idProducto > infoToObj.length) {
                console.log ('ID no encontrado')
                res.json ('Producto no encontrado')
            } else {
                if (req.body.nombre == '' || req.body.precio == '' || req.body.imagen =='') {
                    console.log('Completar todos los campos');
                    res.json('Error, debe completar todos los campos')
                } else {
                    let prodABorrar = infoToObj.findIndex(prod => prod.id === JSON.parse(idProducto));
                    infoToObj.splice (prodABorrar, 1);
                    
                    prodReemplazo = {
                        nombre: req.body.nombre,
                        precio: req.body.precio,
                        id: idProducto
                    }
                    infoToObj.push(prodReemplazo);

                    let infoaTxt = JSON.stringify (infoToObj, null, 2)
                    fs.writeFile ('./productos.txt', infoaTxt, error => {
                        if (error) {
                            console.log('Error al grabar el txt en la actualización del producto')
                        } else {
                            console.log ('Producto actualizado correctamente')
                        }
                    })
                    
                    res.json (prodReemplazo);
                }
            }
        } catch (err) {
            console.log('No se pudo ejecutar la actualización del producto')
        }
    } 
    actualizarProducto ();
})

urlProductos.delete ('/:id', (req, res) => {
    let idProducto = req.params.id
    async function deleteProducto () {
        try {
            let infoTxt = await fs.promises.readFile ('./productos.txt', 'utf-8');
            let infoToObj = JSON.parse (infoTxt);

            let productoABorrar = infoToObj.findIndex (prod => prod.id === JSON.parse(idProducto))
            infoToObj.splice (productoABorrar, 1);

            let infoToTxt = JSON.stringify (infoToObj, null, 2);
            fs.writeFile ('./productos.txt', infoToTxt, error => {
                if (error) {
                    console.log ('No se pudo borrar producto');
                } else {
                    console.log ('Producto eliminado')
                }
            })
            res.json(productoABorrar);
        } catch (err) {
            console.log('No pudimos eliminar el elemento.')
        }
    }
    deleteProducto();
})

app.listen (port, () => {
    console.log(`Escuchando el puerto ${port}`);
})
