/*============================================================================================================
  Coprolalia Firefox Add-on
  by Dr. Mike
  
  This work is provided without any warranty whatsoever. Use at your own risk.
  This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License.
  However, we can do a Creative Commons BY-SA if you offer me to share the $$$ with me. 
  Email: coprolalia.web@gmail.com  
============================================================================================================*/

var coprolalia = 
{   
  adjectives: ['fucking', 'goddamn', 'motherfucking', 'filthy', 'rotten', 'cocksucking', 'assfucking', 'stupid', 'shitty', 'bloody', 'fucked-up'],
  personal: ['asshole', 'motherfucker', 'moron', 'pussy', 'idiot', 'bastard', 'bitch', 'crackhead', 'dickhead', 'cunt', 'assfucker', 'cocksucker', 'cuntsucker', 'hillbilly', 'jackass', 'old fart', 'freak', 'shithead', 'son of a bitch', 'bitch', 'cuntface', 'dumbass', 'scumbag', 'fuckup'],
  splitLen: 31,  
  
  prefs: null,
  prefsObserver: {
    observe: function(subj, topic, data) {       
      if(topic == 'nsPref:changed' && data == 'extensions.coprolalia.active')
        coprolalia.updateStatusDisplay(); 
    }
  },
  
  //----------------------------------------------------------------------------------------------------------
  replaceString: function(str)
  //----------------------------------------------------------------------------------------------------------
  {    
    return str
    
      .replace(
        /\b(the|a|your|my|our|their)\b/gi, 
        '$1 ' + coprolalia.adjectives[Math.floor(Math.random() * coprolalia.adjectives.length)])
      
      .replace(
        /\b(a)n\b/gi, 
        '$1 ' + coprolalia.adjectives[Math.floor(Math.random() * coprolalia.adjectives.length)])
        
      .replace(
        /\b(you)\b/gi, 
        '$1 ' + coprolalia.personal[Math.floor(Math.random() * coprolalia.personal.length)]);
  },
  
  //----------------------------------------------------------------------------------------------------------
  applyTo: function(node)
  //----------------------------------------------------------------------------------------------------------
  {
    var str = '';
    var original = node.data;
    var len;
    var i = 0;
    
    while(i < original.length)
    {
      len = coprolalia.splitLen;
      while(i+len<original.length && !/\s/.test(original[i+len])) len++; // go to next whitespace
      str += coprolalia.replaceString(original.substr(i, len));      
      i += len;    
    }
      
    node.data = str;
  },
  
  //----------------------------------------------------------------------------------------------------------  
  inspect: function(node)
  //----------------------------------------------------------------------------------------------------------
  {
    if(!node) return;
    
    if(node.nodeType == Node.TEXT_NODE)
    {
      coprolalia.applyTo(node);
    } 
    else 
    {
      if(node.nodeType == Node.ELEMENT_NODE) 
      {  
        var exclude = ['title', 'textarea', 'input', 'script', 'pre'];
        var nodeName = node.tagName.toLowerCase();
        var i;
        
        for(i=0; i<exclude.length; i++)
          if(nodeName == exclude[i]) return;
                
        for(i=0; i<node.childNodes.length; i++)
          coprolalia.inspect(node.childNodes[i]);
      }
    }
  },
  
  //----------------------------------------------------------------------------------------------------------
  statusClick: function()
  //----------------------------------------------------------------------------------------------------------
  {
    coprolalia.prefs.setBoolPref('extensions.coprolalia.active', 
      !coprolalia.prefs.getBoolPref('extensions.coprolalia.active'));
    
    coprolalia.updateStatusDisplay();
  },
  
  //----------------------------------------------------------------------------------------------------------
  updateStatusDisplay: function()
  //----------------------------------------------------------------------------------------------------------
  {
    var panel = document.getElementById('coprolalia-panel');
    if(coprolalia.prefs.getBoolPref('extensions.coprolalia.active')) 
    {
      panel.image = 'chrome://coprolalia/content/images/on.png';
      panel.tooltipText = 'Coprolalia is active. Click to deactivate.';
    } 
    else 
    {
      panel.image = 'chrome://coprolalia/content/images/off.png';
      panel.tooltipText = 'Coprolalia is inactive. Click to activate.';
    }
  },

  //----------------------------------------------------------------------------------------------------------
  start: function(event)
  //----------------------------------------------------------------------------------------------------------
  {
    if(!coprolalia.prefs.getBoolPref('extensions.coprolalia.active'))
      return;
    
    if(event.originalTarget.nodeName != '#document')
      return;
    
    coprolalia.inspect(event.originalTarget.documentElement);    
  },

  //----------------------------------------------------------------------------------------------------------
  initialize: function()
  //----------------------------------------------------------------------------------------------------------
  {
    if(!coprolalia.prefs)
    {
      coprolalia.prefs = Components.classes['@mozilla.org/preferences-service;1']
        .getService(Components.interfaces.nsIPrefBranch);
      coprolalia.prefs.addObserver('extensions.coprolalia.', coprolalia.prefsObserver, false);
    }      
        
    coprolalia.updateStatusDisplay();
    
    var browser = document.getElementById('appcontent');
    if(browser) browser.addEventListener('DOMContentLoaded', coprolalia.start, true);
  }
};

window.addEventListener('load', coprolalia.initialize, false);