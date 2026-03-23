const gasolinerasRouter = require('./Frontend/Gasolineras/rutas/gasolineras.rutas');
console.log('Router stack size:', gasolinerasRouter.stack.length);
gasolinerasRouter.stack.forEach((layer, i) => {
    if (layer.route) {
        console.log(`Layer ${i}: path='${layer.route.path}' methods=`, layer.route.methods);
    }
});
