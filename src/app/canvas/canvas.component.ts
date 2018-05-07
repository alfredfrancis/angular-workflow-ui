import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

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
        inputPort:{name: "node_2_input"},
        outputPorts: [{name: "node_2_output_1"}],
        position: {x: 300, y: 450},
        isDragging: false 
      },
      {
        name: "node_3", 
        inputPort:{name: "node_3_input"},
        outputPorts: [{name: "node_3_output_1"}],
        position: {x: 600, y: 450},
        isDragging: false 
      }
    ]

    connections = [
      {
        "start":"node_1_output_1",
        "end":"node_2_input"
      }

    ]

  	edges = [];
  	selectedNode = this.nodes[0];
    connection: any = [];
    
    drawing: boolean =false;
    startPosition:any;
    endPosition:any;

  	constructor() { }
 	  
    ngOnInit() {
       // this.draw();
      
      this.nodes.map(function(node){
          let margin = 10; 
          let port_width = 15; 
          let width = margin*(node.outputPorts.length+1) + (node.outputPorts.length)*port_width;
          node["width"] = width;
      }) 
    }
    
    ngAfterViewInit(){

      this.drawConnections()
    }

    drawConnections(){
      
      this.connections.map((connection)=>{
        console.log(connection)
        let startPos = this.getPositionByID(connection.start)
        let endPos = this.getPositionByID(connection.end)
        console.log(startPos,endPos)
        this.drawLine(startPos.left,startPos.top,endPos.left,endPos.top)
       });
    }

    getPositionByID(div_id) {
      let el = document.getElementById(div_id);
      console.log(el)
      let rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
      
    }

    onDragStart($event, node): void{
      $event.dataTransfer.setDragImage( new Image(), 0, 0);
      // todo : find more elegant solution
      node.dragStart = {x: $event.pageX, y: $event.pageY}; 
    }

    onDrag($event, node): void{
      let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  
    link($event, port): void{
      console.log("port dragging");
      console.log($event, port)
    }


  

  
    clikPort($event,port,node){
      if(this.drawing){
        console.log("end drawing")
        this.endPosition={
          "pageX":$event.pageX,
          "pageY":$event.pageY,
          "port":port.name
        }
        this.drawing= false;
        this.drawLine(this.startPosition.pageX,this.startPosition.pageY,this.endPosition.pageX,this.endPosition.pageY);
        this.connections.push({
          "start":this.startPosition.port,
          "end":this.endPosition.port
        })
      }else{
        console.log("start drawing")
        this.startPosition={
          "pageX":$event.pageX,
          "pageY":$event.pageY,
          "port":port.name
        }
        this.drawing= true;
      }
    }

    drawEdge(point1, point2): void{

    }

    dragLink($event, port): void{
      console.log($event, port)
    }

    createLink($event, port){
      console.log($event, port)
    }

    drawLine(x1,y1,x2,y2){
  		let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');

  		if(canvas == null ){
  			throw Error("Canvas with given not found");
  		}

        console.log("drawing line")
  		  var ctx = canvas.getContext('2d');
  			ctx.beginPath();
        ctx.strokeStyle = 'green';
        //ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(x1, y1);
  			ctx.lineTo(x2, y2);
  			// ctx.arcTo(this.endPosition["pageX"], this.startPosition["pageY"],this.endPosition["pageX"], this.endPosition["pageY"],20);
  			ctx.stroke();

    }
  	portDrag($event){
  		let posX = $event.clientX; 
  		let posY = $event.clientY; 
		
  		let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');

  		if(canvas == null ){
  			throw Error("Canvas with given not found");
  		}

  		if (canvas.getContext) {
  		  var ctx = canvas.getContext('2d');
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

  	draw() {
  		let canvas :HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph-edges');

  		if(canvas == null ){
  			throw Error("Canvas with given not found");
  		}

  		    var ctx = canvas.getContext('2d');
          ctx.beginPath(); 
          ctx.moveTo(50,20);         // Create a starting point
          ctx.arcTo(100,20,100,70,50); // Create an arc
          ctx.stroke();                // Draw it

	}

}
