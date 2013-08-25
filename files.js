$(document).ready(function(){
  //window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  //window.requestFileSystem(window.TEMPORARY, 5*1024*1024, initFS, errorHandler);
  alert();
});

function initFS(fs){
  fs.root.getDirectory('Documents', {create: false}, function(dirEntry) {
    alert('You have just created the ' + dirEntry.name + ' directory.');
    createDir(fs.root, 'Documents/Images/Nature/Sky/'.split('/'));  
    //createDir(fs.root, 'Documents/Nature/'.split('/'));
    //createDir(fs.root, 'Documents/sky/'.split('/'));
    //copy(fs.root, 'log.txt', 'Documents/');
    //copy(fs.root, 'song.mp3', 'Documents/');
    readDir(fs);
  }, errorHandler);
       
} 

function readDir(fs){
  
  fs.root.getDirectory('Documents', {}, function(dirEntry){
    var dirReader = dirEntry.createReader();
    var par = dirEntry.GetParent;
    alert(Par.name);
    dirReader.readEntries(function(entries) {
      for(var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isDirectory){
          console.log('Directory: ' + entry.toURL());
        }
        else if (entry.isFile){
          console.log('File: ' + entry.toURL());
        }
      }
    }, errorHandler);
  }, errorHandler);
  

}

function createDir(rootDir, folders) {
  rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
    if (folders.length) {
      createDir(dirEntry, folders.slice(1));
    }
  }, errorHandler);
};

function copy(currDir, srcEntry, destDir) {
  currDir.getFile(srcEntry, {}, function(fileEntry) {
    currDir.getDirectory(destDir, {}, function(dirEntry) {
      fileEntry.copyTo(dirEntry);
    }, errorHandler);
  }, errorHandler);
}


function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}
