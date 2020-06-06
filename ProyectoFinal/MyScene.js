
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  constructor (myCanvas) {
    super();

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    // Se añade a la gui los controles para manipular los elementos de esta clase
    this.gui = this.createGUI ();

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera ();

    // Un suelo
    this.createGround ();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper (5);
    this.add (this.axis);

    // Objeto jugador
    this.motoJugador = new MyJugador(this.gui, "Controles jugador");
    this.motoJugador.position.y = 2;
    this.motoJugador.position.z = -220;
    this.add (this.motoJugador);


    // Objeto obstaculo (mas adelante se crearan diversas copias, por ahora uno para hacer pruebas)
    this.obstaculo = new MyObstaculo(this.gui, "Controles obstaculo");
    this.obstaculo.position.y = 5;
    this.obstaculo.position.z = -200;
    this.add (this.obstaculo);


    // Inicialización del raycaster usado para detectar colisiones frontales
    this.raycasterFrontal = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, 0, 1 ), -10, 3 );

    // Incluimos en un array los objetos visualizados por el raycaster
    this.obstaculos = [];
    var num_obstaculos = Math.floor(Math.random() * 10);
    for(var i = 0; i < num_obstaculos;i++){
      this.obstaculo = new MyObstaculo(this.gui, "Controles obstaculo " + i);
      var position = Math.floor(Math.random() * 100) -200;
      this.obstaculo.position.z = position;
      this.obstaculo.position.y = 5;
      this.add (this.obstaculo);
      this.obstaculos.push(this.obstaculo.getMesh());
    }

    // Por último creamos el modelo.
    // El modelo puede incluir su parte de la interfaz gráfica de usuario. Le pasamos la referencia a
    // la gui y el texto bajo el que se agruparán los controles de la interfaz que añada el modelo.
  }

  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0, 20, -260);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,-0);
    this.camera.lookAt(look);
    this.add (this.camera);

  }

  createGround () {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una motoJugador con muy poca altura
    var geometryGround = new THREE.BoxGeometry (100,1,500);

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('./carretera.png');
    var materialGround = new THREE.MeshPhongMaterial ({map: texture});

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh (geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.1;

    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add (ground);
  }

  createGUI () {
    // Se crea la interfaz gráfica de usuario
    var gui = new dat.GUI();

    // La escena le va a añadir sus propios controles.
    // Se definen mediante una   new function()
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = new function() {
      // En el contexto de una función   this   alude a la función
      this.lightIntensity = 0.5;
      this.axisOnOff = true;
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder ('Luz y Ejes');

    // Se le añade un control para la intensidad de la luz
    folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1).name('Intensidad de la Luz : ');

    // Y otro para mostrar u ocultar los ejes
    folder.add (this.guiControls, 'axisOnOff').name ('Mostrar ejes : ');

    return gui;
  }

  createLights () {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
    // La añadimos a la escena
    this.add (ambientLight);

    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
    this.spotLight.position.set( 60, 60, 40 );
    this.add (this.spotLight);
  }

  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();

    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }

  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);

    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  onKeyDown (event) {
    var key = event.which || event.keyCode;
    switch (key) {
      case 37 : // Cursor a la izquierda
        this.motoJugador.left = true;
        //console.log("left");
        break;
      case 38 : // Cursor arriba
        this.motoJugador.forward = true;
        //console.log("up");
        break;
      case 39 : // Cursor a la derecha
        this.motoJugador.right = true;
        //console.log("right");
        break;
      case 40 : // Cursor abajo
        this.motoJugador.backward = true;
        //console.log("down");
        break;
    }
  }

  onKeyUp (event) {
    var key = event.which || event.keyCode;
    switch (key) {
      case 37 : // Cursor a la izquierda
        this.motoJugador.left = false;
        break;
      case 38 : // Cursor arriba
        this.motoJugador.forward = false;
        break;
      case 39 : // Cursor a la derecha
        this.motoJugador.right = false;
        break;
      case 40 : // Cursor abajo
        this.motoJugador.backward = false;
        break;
    }
  }

  update () {
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.

    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())

    // Se actualizan los elementos de la escena para cada frame
    // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
    this.spotLight.intensity = this.guiControls.lightIntensity;

    // Se muestran o no los ejes según lo que idique la GUI
    this.axis.visible = false;


    // Se actualiza el resto del modelo

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());
    //this.octree.update();
    this.motoJugador.update();
    this.obstaculo.update();

    //this.camera.position.z += 0.5;

    // Ajustamos el raycaster a la posición actual del jugador para detectar colisiones
    this.raycasterFrontal.ray.origin.copy(this.motoJugador.position);
    var intersecciones = this.raycasterFrontal.intersectObjects( this.obstaculos );

    if (intersecciones.length > 0) {
      console.log("Colision");
    }

    /*
    // OCTREE
    this.octreeObjects = this.octree.search(this.motoJugador.position, 0.00001, true);

    if (this.octreeObjects.length > 1){
      console.log("Colision");
    }
    // Guardar TowerBall cercanas
    let tbs = [];
    for(let tb of this.octreeObjects) {
      console.log(tb);
        tbs.push(tb.object.userData);
    }
    console.log(tbs.length);
    */

  }
}

/// La función   main
$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());
  window.addEventListener ("keydown", () => scene.onKeyDown(event));
  window.addEventListener ("keyup",   () => scene.onKeyUp(event));

  // Que no se nos olvide, la primera visualización.
  scene.update();
});