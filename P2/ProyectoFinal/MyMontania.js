
class MyMontania extends THREE.Object3D {
  constructor() {
    super();

    var montania = new MyModel("../models/montania.obj","../models/montania.mtl", 0x090951,1,0x04FEFD);

    // Los añadimos a la escena
    this.add (montania);
  }


  updateGeometry () {
    this.scale.set (this.guiControls.sizeX,this.guiControls.sizeY,this.guiControls.sizeZ);
  }

  getMesh() {
     return this.mesh;
  }

  update () {

  }
}