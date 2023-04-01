let eta;

function updateETA() {
    fetch('http://localhost:3000/eta')
        .then(response => response.text())
        .then(data => {
            eta = data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
setInterval(()=>{
    if(eta > 20) updateETA();
},20000);

setInterval(()=>{
    eta--;
},1000)


module.exports.eta = eta;