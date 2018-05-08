import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

    settings = {
      "last_node_count":0
    };
    currentNode:any;
  	nodes = [
      //   {
      //     name: "node_1", 
      //     inputPort: {name: "node_1_input"},
      //     outputPorts: [{name: "node_1_output_1"},{name: "node_1_output_2"}],
      //     position: {x: 350, y: 100}, 
      //     isDragging: false 
      // },
      // {
      //   name: "node_2", 
      //   inputPort:{name: "node_2_input"},
      //   outputPorts: [{name: "node_2_output_1"}],
      //   position: {x: 300, y: 450},
      //   isDragging: false 
      // },
      // {
      //   name: "node_3", 
      //   inputPort:{name: "node_3_input"},
      //   outputPorts: [{name: "node_3_output_1"}],
      //   position: {x: 600, y: 450},
      //   isDragging: false 
      // }
    ]

    connections = [
      // {
      //   "start":"node_1_output_1",
      //   "end":"node_2_input"
      // }
    ]

  	edges = [];
  	selectedNode = this.nodes[0];
    connection: any = [];
    
    drawing: boolean =false;
    startPosition:any;
    endPosition:any;

  	constructor() { }
 	  
    ngOnInit() {
      this.nodes.map(function(node){
          let margin = 10; 
          let port_width = 15; 
          let width = margin*(node.outputPorts.length+1) + (node.outputPorts.length)*port_width;
          node["width"] = width;
      }) 
    }
    
    ngAfterViewInit(){
      // Render Flow connections from JSON Data
      this.drawConnections()
    }

    drawConnections(){
      //draw connecticurrentNodeon between two points
      this.connections.map((connection)=>{
        let startPos = this.getPositionByID(connection.start)
        let endPos = this.getPositionByID(connection.end)
        this.drawLine(startPos.left,startPos.top,endPos.left,endPos.top)
       });
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
      }else if(this.currentNode >= 0){
        console.log("im current node")
        this.nodes.splice(this.currentNode,1)
        console.log(this.nodes)
      }
    }
    setCurrentNode(nodeIndex){
      console.log("im selected",nodeIndex)
      this.currentNode = nodeIndex
    }
  
    /************************************************* Node events ends here ************************************************************** */



    /************************************************* Connection events starts here ************************************************************** */

    clikPort($event,port,type){
      if(this.drawing && type=="input"){
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
      }else if(type=="output" && !this.drawing){
        this.startPosition={
          "pageX":$event.pageX,
          "pageY":$event.pageY,
          "port":port.name
        }
        this.drawing= true;
      }else{
        this.drawing=false;
      }
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


    /************************************************* Connection events ends here ************************************************************** */



}
