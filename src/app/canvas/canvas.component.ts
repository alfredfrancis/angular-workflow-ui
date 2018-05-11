import { Component, OnInit } from '@angular/core';
//import { port } from '_debugger';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

    settings = {
      "last_node_count":0
    };
    onport = false;

    currentNode:any;
    currentNodeIndex:any;
  	nodes = [
        {
          name: "node_1", 
          inputPort: {name: "node_1_input"},
          outputPorts: [{name: "node_1_output_1"},{name: "node_1_output_2"}],
          position: {x: 350, y: 100}, 
          isDragging: false 
      },
      {
        name: "node_2", 
        inputPort: {name: "node_2_input"},
        outputPorts: [{name: "node_2_output_1"},{name: "node_2_output_2"}],
        position: {x: 350, y: 500}, 
        isDragging: false 
    }
    ]

    connections = [
      {
        "startNode":"node_1",
        "endNode":"node_2",
        "start":"node_1_output_1",
        "end":"node_2_input"
      }
    ]

  	edges = [];
  	selectedNode = this.nodes[0];
    connection: any = [];
    canvas:HTMLCanvasElement;
    
    drawing: boolean =false;
    startPosition:any;
    endPosition:any;
    startPortNode:any;
    endPortNode:any;

    constructor() { }




 	  
    ngOnInit() {
      this.canvas = <HTMLCanvasElement>document.getElementById('graph-edges');
      this.nodes.map(function(node){
          let margin = 10; 
          let port_width = 15; 
          let width = margin*(node.outputPorts.length+1) + (node.outputPorts.length)*port_width;
          node["width"] = width;
      }) 
    }
    

    ngAfterViewInit(){
      var canvas = <HTMLCanvasElement> document.getElementById('graph-edges');
      var divHeight = document.getElementById('graph-nodes').clientHeight;
      var divWidth = document.getElementById('graph-nodes').clientWidth;
      canvas.height = divHeight;
      canvas.width = divWidth;
      // Render Flow connections from JSON Data
      this.drawConnections()
    }

    drawConnections(){
      //draw connecticurrentNodeon between two points
      this.connections.map((connection)=>{
        let startPos = this.getPositionByID(connection.start)
        let endPos = this.getPositionByID(connection.end)
        this.drawLine(startPos.left,startPos.top,endPos.left,endPos.top,false)
       });
    }


    refreshCanvas(){

      var ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }

    getNodeFromPort(portName){
      console.log("portName",portName)

      for (let node of this.nodes) {
        console.log('node',node);
        console.log('port_name',portName);
        if (node.inputPort.name == portName){
          console.log("matched")
          return node.name

        }
        for (let port of node.outputPorts){
          if (port.name == portName){
            return node.name
          }
        }
      }
    }
    setMouseOver(bool){
      this.onport = bool;
    }
    mousedown(){
      if(!this.onport){
        console.log("mousedown")
        this.drawing=false;
        this.refreshCanvas();
        this.drawConnections()
      }

    }

    mouseEnter(events){
      if (this.drawing){
        //console.log("mouse enter : " + events.x);
        //console.log("mouse enter : " + events.y);
        this.refreshCanvas();
        this.drawConnections()
        //this.refreshCanvas();
        this.drawLine(this.startPosition.pageX,this.startPosition.pageY,events.x,events.y,true);
      }
      
   }


    getPositionByID(div_id) {
      // find position of html element by its ID
      let el = document.getElementById(div_id);
      let rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
      
    }

    /************************************************* Node  events starts here ************************************************************** */

    onDragStart($event, node): void{
      $event.dataTransfer.setDragImage( new Image(), 0, 0);
      // todo : find more elegant solution
      node.dragStart = {x: $event.pageX, y: $event.pageY}; 
    }

    
    onDrag($event, node): void{
      //let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');
      //var ctx = this.canvas.getContext('2d');
      //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.refreshCanvas()

      let relX: number = $event.pageX - node.dragStart.x; 
      let relY: number = $event.pageY - node.dragStart.y;
      node.position.x += relX; 
      node.position.y += relY; 
      node.dragStart = {x: $event.pageX, y: $event.pageY}; 
      this.drawConnections()
    }

    dragEnd($event, node): void{
      let relX: number = $event.pageX - node.dragStart.x; 
      let relY: number = $event.pageY - node.dragStart.y;
      node.position.x += relX; 
      node.position.y += relY; 
    }

    addNode(){
    let node_name = <any> this.settings.last_node_count+1;
     let new_node =  {
        name: "node_"+node_name, 
        inputPort: {name: `node_${node_name}_input`},
        outputPorts: [{name: `node_${node_name}_output_1`}],
        position: {x: 10, y: 40}, 
        isDragging: false,
        last_port_count:1
      }
      this.nodes.push(
        new_node
      )
      this.settings.last_node_count +=1
    }

    deleteNode(nodeIndex=-1){
      if(nodeIndex > 0){
        console.log("im null")
        this.nodes.splice(nodeIndex,1)
      }else if(this.currentNodeIndex >= 0){
        console.log("im current node")
        this.nodes.splice(this.currentNodeIndex,1)
        console.log(this.nodes)
        this.deleteConnections()
      }
    }

    deleteConnections(){

      console.log('Connections-old',this.connections)

      // get input nodes and ouput nodes
      let input_port = this.currentNode.name
      console.log(this.currentNode,'input_port',input_port)

      // pop incomming connections to selected node
      this.connections = this.connections.filter((connection)=>{
        console.log('connection.node != input_port',connection.endNode , input_port,connection.end != input_port)
        if (connection.endNode != input_port){
          return true
        }
      });

      // pop outgoing connections to selected node
      this.connections = this.connections.filter((connection)=>{
        console.log('connection.node != input_port',connection.startNode , input_port,connection.end != input_port)
        if (connection.startNode != input_port){
          return true
        }
      });

      console.log('Connections-New',this.connections)

      // refresh canvas
      this.refreshCanvas()

      // redraw all connections
      this.drawConnections()


      
      
    }

    setCurrentNode(nodeIndex,node){
      console.log("im selected",nodeIndex)
      this.currentNodeIndex = nodeIndex
      this.currentNode = node
      console.log(this.currentNode)
    }
  
    /************************************************* Node events ends here ************************************************************** */



    /************************************************* Connection events starts here ************************************************************** */

    clikPort($event,node_name,port,type){
      
      
      if(this.drawing && type=="input"){
        this.endPosition={
          "pageX":$event.pageX,
          "pageY":$event.pageY,
          "port":port.name
        }
        
        this.drawing= false;
        this.drawLine(this.startPosition.pageX,this.startPosition.pageY,this.endPosition.pageX,this.endPosition.pageY);
        //console.log("SelfLoop",this.getNodeFromPort(this.startPosition.port),this.getNodeFromPort(this.endPosition.port))
        if(this.getNodeFromPort(this.startPosition.port)!=this.getNodeFromPort(this.endPosition.port)){
          /* This if condition is to avoid self loop */

          this.connections.push({
            "startNode":this.getNodeFromPort(this.startPosition.port),
            "endNode":this.getNodeFromPort(this.endPosition.port),
            "start":this.startPosition.port,
            "end":this.endPosition.port
          })



        }else{
          console.log("Self Loop",">>>>>>>>>>>>>>>>>>>")
          this.refreshCanvas();
          this.drawConnections();
        }

      }else if(type=="output" && !this.drawing){
        /* Node name of selected port */
        this.startPortNode

        this.startPosition={
          "pageX":$event.pageX,
          "pageY":$event.pageY,
          "port":port.name
        }
        this.drawing= true;
      }else{

        console.log("THIS >>>>>")
        this.drawing=false;
      }

      //console.log("node_name",this.connections)
      this.refreshCanvas();
      this.drawConnections();

    }

    getXYOffsets(){
    // get offsets for graph-nodes div
    let el = document.getElementById('graph-nodes')
    for (var lx=0, ly=0;
      el != null;
      lx += el.offsetLeft, ly += el.offsetTop, el = <HTMLElement> el.offsetParent);
      return {x: lx,y: ly};
    }


     drawLine(x1,y1,x2,y2,dashed=false){
  		//let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');
  		if(this.canvas == null ){
  			throw Error("Canvas with given not found");
  		}

      let offsets = this.getXYOffsets()
      let x_offset = offsets.x
      let y_offset = offsets.y

      x1 = (x1-x_offset)+10
      y1 = (y1-y_offset)+10
      x2 = (x2-x_offset)+10
      y2 = (y2-y_offset)

      var ang1 = 190;  // in radians
      var ang2 = 90;

      var len =  Math.hypot(x2-x1,y2-y1);

      var ax1 = Math.cos(ang1) * len * (1/3); 
      var ay1 = Math.cos(ang1) * len * (1/3);

      var ax2 = Math.cos(ang2) * len * (1/3); 
      var ay2 = Math.sin(ang2) * len * (1/3);




      console.log("drawing line")
      var ctx = this.canvas.getContext('2d');
      ctx.beginPath();

      // if(this.drawing && dashed){
      //   console.log('im working')
      //   ctx.setLineDash([5, 3]);
        
      // }
      
      ctx.strokeStyle = 'green';
      // //ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.moveTo(x1,y1);
      ctx.bezierCurveTo(
          x1 + ax1, y1 + ay1,
          x2 - ax1, y2 - ay2,
          x2, y2
      );
      // ctx.arcTo(this.endPosition["pageX"], this.startPosition["pageY"],this.endPosition["pageX"], this.endPosition["pageY"],20);
      ctx.stroke();
      

    }


    portDrag($event){
  		let posX = $event.clientX; 
  		let posY = $event.clientY; 
		
  		//let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');

  		if(this.canvas == null ){
  			throw Error("Canvas with given not found");
  		}

  		if (this.canvas.getContext) {
  		  var ctx = this.canvas.getContext('2d');
  			ctx.beginPath();
  			ctx.strokeStyle = 'green';
  			ctx.moveTo(posX, posY);
  			ctx.arcTo(posX, posY, posX+ 20, posY + 20, 20);
  			ctx.stroke();
  		}
  		else{
  			throw Error("Element is not canvas");
  		}
  	}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) { 
      console.log(event)
      if (event.key === "Delete") {
        this.drawing = false;
        this.connections = this.connections.filter((connection)=>{
          if (connection.start != this.startPosition.port){
            return true
          }
        });
        console.log("deleted",this.connections )
        this.refreshCanvas();
        this.drawConnections();

    }
    
    }

    /************************************************* Connection events ends here ************************************************************** */



}
