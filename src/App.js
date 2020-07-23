import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Imagelinkform from './Components/Imagelinkform/Imagelinkform';
import Logo from './Components/Logo/Logo';
import Rank from './Components/Rank/Rank';
import './App.css';
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai';
import Facerecognition from './Components/FaceRecognition/Facerecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from "./Components/Register/Register";

const particleoption={
  particles: {
    line_linked: {
      number:{
        value :100,
        density:{
          enable :true,
          value_area:800,
        },
      
      },
    }
  }
}

const initialstate={
    input : '',
    imageurl : '',
    box : {},
    route : 'signin',
    issignedin : false,
    user:{
      id:'',
      name:'',
      email:'',
      entries : 0,
      joined :''
    }
  }

class App extends Component {
  constructor(){
    super();
    this.state=initialstate
  }
  
  loaduser=(data) =>{
    this.setState({user:{
      id:data.id,
        name:data.name,
        email:data.email,
        entries : data.entries,
        joined :data.joined
    }})
  }

  calculatefacelocation = (data) =>{
    const Clarifaiface = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image=document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftcol : Clarifaiface.left_col * width,
      toprow : Clarifaiface.top_row * height,
      rightcol : width - (Clarifaiface.right_col * width),
      bottomrow : height - (Clarifaiface.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box : box});
  }

  onInputChange = (event) =>{
    this.setState({input : event.target.value})
  }

  onSubmit =() =>{
    this.setState({imageurl : this.state.input }); 
    // app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
    fetch('https://whispering-reef-54380.herokuapp.com/imageurl',{
      method:'post',
      headers:{'Content-type':'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    }).then(response=>response.json())    
    .then(response =>{
    if(response){
      fetch('https://whispering-reef-54380.herokuapp.com/image',{
        method:'put',
        headers:{'Content-type':'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      }).then(response=>response.json())
      .then(count=>{
        this.setState(Object.assign(this.state.user,{entries:count}))
      }).catch(console.log)
    } 
      this.displayFaceBox(this.calculatefacelocation(response))})
    .catch(err => console.log(err))
}

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialstate)
    }
    else if (route === 'home'){
      this.setState({issignedin : true})
    }
    this.setState({route : route})
  }

  render(){
  const {issignedin,imageurl,route,box}=this.state;
  return (
    <div className="App">
      <Particles className='particles'
        params={particleoption}/>
      <Navigation issignedin={issignedin} onRouteChange={this.onRouteChange} />
      {this.state.route==='home'
      ?<div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <Imagelinkform onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
        <Facerecognition  box={box} imageurl={imageurl}/>
      </div> 
      :(
        route==='signin'
      ? <SignIn onRouteChange={this.onRouteChange} loaduser={this.loaduser}/>
      : <Register onRouteChange={this.onRouteChange} loaduser={this.loaduser} />
      )
      }
    </div>
  );
  }
}


export default App;
