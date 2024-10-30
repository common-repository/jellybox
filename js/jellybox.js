/*
* Plugin Name: jellybox
* Plugin URI: http://www.jellyrobotics.com/
* Description: Tilted and/or Animated Text, Images and Boxes
* Version: 1.4
* Author: John Carter (not from Mars)
* Author URI: http://www.jellyrobotics.com
*
*
* Copyright © 2013 JellyFilled Studios <john@casacarter.com>
* All rights reserved.
*
* This program is distributed under the GNU General Public License, Version 2,
* June 1991. Copyright © 1989, 1991 Free Software Foundation, Inc., 51 Franklin
* St, Fifth Floor, Boston, MA 02110, USA
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
* ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*/

// Globals
//
JellyBoxMaxIndex = 100000;
JellyBoxSaveOnLoadEvent = null;
JellyBoxPendingStageTwo = new Array();

var JellyBoxLoadController = function()
	{
	var i;

	for ( i=0; i<JellyBoxPendingStageTwo.length; i++ )
		JellyBoxPendingStageTwo[i].initStageTwo();

	if ( JellyBoxSaveOnLoadEvent != null )
		JellyBoxSaveOnLoadEvent();
	}


var JellyBoxClickController = function()
	{
	var self = this;
	var clickfuncs = new Array();

	this.add = function( clickfunc )
		{
		clickfuncs.push(clickfunc);
		return self;
		}

	this.click = function( event )
		{
		var i;
		for ( i=0; i<clickfuncs.length; i++ )
			if ( clickfuncs[i] )
				clickfuncs[i]( event );
		return self;
		}

	return self;
	}


var JellyBoxLayerController = function( obj )
	{
	var self = this;
	var containers = new Array();

	containers.push(obj);

	// Queue Container Objects for zIndex management
	//
	var parent = obj.parentNode;
	while( parent.tagName == 'DIV' )
		{
		containers.push(parent);
		parent = parent.parentNode;
		}

	this.push = function()
		{
		var i;
		for ( i=0; i<containers.length; i++ )
			{
			JellyBoxMaxIndex++;
			containers[i].saveIndexLayer = containers[i].style.zIndex;
			containers[i].style.zIndex = JellyBoxMaxIndex;
			}
		return self;
		}

	this.pop = function()
		{
		var i;
		for ( i=0; i<containers.length; i++ )
			containers[i].style.zIndex = containers[i].saveIndexLayer;
		return self;
		}

	return self;
	}


var JellyBoxController = function()
	{
	var timeouttimer = null;
	var timeoutdelay = null;
	var intervaltimer = null;
	var intervaldelay = null;
	var jellyBoxObj = null;
	var toggle = false;
	var self = this;


	function intval( num )
		{
		// parseFloat twice apparently prevents exponential numbers and things like 0.00000000
		return Math.round(parseFloat(parseFloat(num).toFixed(12)));
		}

	function fixedval( num )
		{
		// parseFloat twice apparently prevents exponential numbers and things like 0.00000000
		return parseFloat(parseFloat(num).toFixed(12));
		}


	this.setPosition = function( newTop, newLeft, newAngle )
		{
		jellyBoxObj.jellydata.top = newTop;
		jellyBoxObj.jellydata.left = newLeft;

		// if there is no angle animation and no pre-set angle then don't do the Matrix commands
		//
		if ( newAngle==0 && jellyBoxObj.jellydata.angle==0 )
			{
			jellyBoxObj.style.top = jellyBoxObj.jellydata.top + 'px';
			jellyBoxObj.style.left = jellyBoxObj.jellydata.left + 'px';
			return self;
			}

		jellyBoxObj.jellydata.angle = newAngle;

		var radAngle = Math.PI * jellyBoxObj.jellydata.angle / 180;

		if ( window.navigator.userAgent.indexOf ( 'MSIE ' ) <= 0 || typeof document.documentElement.style.opacity!='undefined' )
			radAngle = -radAngle;

		var sinAngle = fixedval(Math.sin(radAngle));
		var cosAngle = fixedval(Math.cos(radAngle));

		var m11 = cosAngle;
		var m12 = -sinAngle;
		var m21 = sinAngle;
		var m22 = cosAngle;

		if ( window.navigator.userAgent.indexOf ( 'MSIE ' ) <= 0 || typeof document.documentElement.style.opacity!='undefined' )
			{
			jellyBoxObj.style.WebkitTransform = 'matrix('+ m11 +','+ m12 +','+ m21 +','+ m22 +',' + 0 + ',' + 0 + ')';
			jellyBoxObj.style.MozTransform = 'matrix('+ m11 +','+ m12 +','+ m21 +','+ m22 +',' + 0 + 'px,' + 0 + 'px)';
			jellyBoxObj.style.msTransform = 'matrix('+ m11 +','+ m12 +','+ m21 +','+ m22 +',' + 0 + ',' + 0 + ')';
			jellyBoxObj.style.OTransform = 'matrix('+ m11 +','+ m12 +','+ m21 +','+ m22 +',' + 0 + ',' + 0 + ')';
			jellyBoxObj.style.transform = 'matrix('+ m11 +','+ m12 +','+ m21 +','+ m22 +',' + 0 + ',' + 0 + ')';

			jellyBoxObj.style.top = jellyBoxObj.jellydata.top + 'px';
			jellyBoxObj.style.left = jellyBoxObj.jellydata.left + 'px';
			}
		else
			{
			var halfHeight = jellyBoxObj.jellydata.height/2;
			var halfWidth = jellyBoxObj.jellydata.width/2;
			var radius = fixedval(Math.sqrt(halfHeight*halfHeight + halfWidth*halfWidth));
			var xOrigin = jellyBoxObj.jellydata.left + halfWidth;
			var yOrigin = jellyBoxObj.jellydata.top + halfHeight;
			var aOrigin = fixedval(Math.atan( halfWidth/halfHeight ));
			var angle = 0;

			// Upper Left
			angle = Math.PI/2 - aOrigin + Math.PI - radAngle;
			ulx = intval(Math.cos(angle)*radius + xOrigin);
			uly = intval(Math.sin(angle)*radius + yOrigin);

			// Lower Right
			angle = Math.PI/2 - aOrigin + Math.PI*2 - radAngle;
			lrx = intval(Math.cos(angle)*radius + xOrigin);
			lry = intval(Math.sin(angle)*radius + yOrigin);

			// Lower Left
			angle = aOrigin + Math.PI/2 - radAngle;
			llx = intval(Math.cos(angle)*radius + xOrigin);
			lly = intval(Math.sin(angle)*radius + yOrigin);

			// Upper Right
			angle = aOrigin + Math.PI/2 + Math.PI - radAngle;
			urx = intval(Math.cos(angle)*radius + xOrigin);
			ury = intval(Math.sin(angle)*radius + yOrigin);

			// Currect issues with IE img rotations getting jagged edges (only needs to be applied once)
			//
			if ( !jellyBoxObj.jellydata.ieImagesFiltered )
				{
				jellyBoxObj.jellydata.ieImagesFiltered = true;

				var rotatingImg = jellyBoxObj.getElementsByTagName("img");

				if ( rotatingImg != null )
					{
					var i;
					for ( i=0; i<rotatingImg.length; i++ )
						{
						rotatingImg[i].style.zoom = 1;

						if ( rotatingImg[i].style.background.length == 0 )
							rotatingImg[i].style.background = "transparent";

						var imgFilter = rotatingImg[i].currentStyle.getAttribute("filter");
						imgFilter.replace("filter:","");
						imgFilter.replace(";","");
						if ( imgFilter.search("DXImageTransform.Microsoft.gradient")<0 )
							imgFilter += " progid:DXImageTransform.Microsoft.gradient(startColorstr=#00FFFFFF,endColorstr=#00FFFFFF)";
						rotatingImg[i].style.filter = "filter: " + imgFilter + ";";
						}
					}			
				}

			// Handle combining multiple filters
			//
			var thisFilter = jellyBoxObj.currentStyle.getAttribute("filter");
			thisFilter.replace("filter:","");
			thisFilter.replace(";","");
			if ( thisFilter.search("DXImageTransform.Microsoft.Matrix")<0 )
				thisFilter += " progid:DXImageTransform.Microsoft.Matrix()";
			jellyBoxObj.style.filter = "filter: " + thisFilter + ";";

			jellyBoxObj.filters.item("DXImageTransform.Microsoft.Matrix").enabled = 1;
			jellyBoxObj.filters.item("DXImageTransform.Microsoft.Matrix").M11 = m11;
			jellyBoxObj.filters.item("DXImageTransform.Microsoft.Matrix").M12 = m12;
			jellyBoxObj.filters.item("DXImageTransform.Microsoft.Matrix").M21 = m21;
			jellyBoxObj.filters.item("DXImageTransform.Microsoft.Matrix").M22 = m22;
			jellyBoxObj.filters.item("DXImageTransform.Microsoft.Matrix").SizingMethod = 'auto expand';

			var spinTop = Math.min( uly, ury, lry, lly );
			var spinRight = Math.max( ulx, urx, lrx, llx );
			var spinBottom = Math.max( uly, ury, lry, lly );
			var spinLeft = Math.min( ulx, urx, lrx, llx );

			jellyBoxObj.style.top = spinTop + 'px';
			jellyBoxObj.style.left = spinLeft + 'px';
			jellyBoxObj.style.right = spinRight + 'px';
			jellyBoxObj.style.bottom = spinBottom + 'px';
			}

		return self;
		}


	this.setTimeout = function( delaytime )
		{
		if ( timeouttimer != null )
			clearTimeout( timeouttimer );
		timeoutdelay = delaytime;
		timeouttimer = setTimeout( jellyBoxObj.jellydata.controlObj.onclickController.click, timeoutdelay );
		return self;
		}


	this.clearTimeout = function()
		{
		if ( timeouttimer != null )
			clearTimeout( timeouttimer );
		timeouttimer = null;
		timeoutdelay = null;
		return self;
		}


	this.setInterval = function( theInterval )
		{
		if ( intervaltimer != null )
			clearInterval( intervaltimer );
		intervaldelay = theInterval;
		intervaltimer = setInterval( jellyBoxObj.jellydata.controlObj.onclickController.click, intervaldelay );
		return self;
		}


	this.clearinterval = function()
		{
		if ( intervaltimer != null )
			clearInterval( intervaltimer );
		intervaltimer = null;
		intervaldelay = null;
		return self;
		}


	this.click = function()
		{
		self.clicked();

		return self;
		}


	this.finishedReturnMove = function()
		{
		jellyBoxObj.jellydata.layerController.pop();

		jellyBoxObj.style.height = jellyBoxObj.jellydata.saveHeight + 'px';
		jellyBoxObj.style.width = jellyBoxObj.jellydata.saveWidth + 'px';

		self.setPosition( jellyBoxObj.jellydata.saveTop, jellyBoxObj.jellydata.saveLeft, jellyBoxObj.jellydata.saveAngle );

		jellyBoxObj.style.height = jellyBoxObj.jellydata.saveHeight + 'px';
		jellyBoxObj.style.width = jellyBoxObj.jellydata.saveWidth + 'px';

		// final adjustment after possible spinning
		//
		self.setPosition( jellyBoxObj.jellydata.saveTop, jellyBoxObj.jellydata.saveLeft, jellyBoxObj.jellydata.saveAngle );

		jellyBoxObj.jellydata.isBusy = false;

		if ( jellyBoxObj.jellydata.gotimeout > 0 )
			{
			self.setTimeout( jellyBoxObj.jellydata.gotimeout );
			}
		}


	this.stepReturnMove = function()
		{
		var elapsed = new Date().getTime() - jellyBoxObj.jellydata.moveStart;

		var movedPercent = elapsed / jellyBoxObj.jellydata.returnspeed; 

		if ( movedPercent >= 1.0 )
			{
			clearInterval( jellyBoxObj.jellydata.moveInterval );
			self.finishedReturnMove();
			return;
			}

		jellyBoxObj.jellydata.moveTop = intval(jellyBoxObj.jellydata.saveTop + jellyBoxObj.jellydata.deltatop * (1.0-movedPercent));
		jellyBoxObj.jellydata.moveLeft = intval(jellyBoxObj.jellydata.saveLeft + jellyBoxObj.jellydata.deltaleft * (1.0-movedPercent));
		jellyBoxObj.jellydata.moveAngle = intval(jellyBoxObj.jellydata.saveAngle - jellyBoxObj.jellydata.deltaangle * (1.0-movedPercent));
		jellyBoxObj.jellydata.moveHeight = intval(jellyBoxObj.jellydata.saveHeight + jellyBoxObj.jellydata.deltaheight * (1.0-movedPercent));
		jellyBoxObj.jellydata.moveWidth = intval(jellyBoxObj.jellydata.saveWidth + jellyBoxObj.jellydata.deltawidth * (1.0-movedPercent));

		self.setPosition( jellyBoxObj.jellydata.moveTop, jellyBoxObj.jellydata.moveLeft, jellyBoxObj.jellydata.moveAngle );

		jellyBoxObj.style.height = jellyBoxObj.jellydata.moveHeight + 'px';
		jellyBoxObj.style.width = jellyBoxObj.jellydata.moveWidth + 'px';
		}


	this.beginReturnMove = function( jumpstart )
		{
		self.setNextEventTrigger( jellyBoxObj.jellydata.gocontrol );

		if ( jumpstart )
			{
			var elapsed = new Date().getTime() - jellyBoxObj.jellydata.moveStart;
			var movedPercent = elapsed / jellyBoxObj.jellydata.gospeed;
			jellyBoxObj.jellydata.moveStart = new Date().getTime() - (jellyBoxObj.jellydata.returnspeed * (1.0 - movedPercent));
			}
		else
			jellyBoxObj.jellydata.moveStart = new Date().getTime();

		jellyBoxObj.jellydata.moveInterval = setInterval( self.stepReturnMove, 10 );
		}


	this.finishedGoMove = function()
		{
		jellyBoxObj.jellydata.moveTop = intval(jellyBoxObj.jellydata.saveTop + jellyBoxObj.jellydata.deltatop);
		jellyBoxObj.jellydata.moveLeft = intval(jellyBoxObj.jellydata.saveLeft + jellyBoxObj.jellydata.deltaleft);
		jellyBoxObj.jellydata.moveAngle = intval(jellyBoxObj.jellydata.saveAngle - jellyBoxObj.jellydata.deltaangle);
		jellyBoxObj.jellydata.moveHeight = intval(jellyBoxObj.jellydata.saveHeight + jellyBoxObj.jellydata.deltaheight);
		jellyBoxObj.jellydata.moveWidth = intval(jellyBoxObj.jellydata.saveWidth + jellyBoxObj.jellydata.deltawidth);

		self.setPosition( jellyBoxObj.jellydata.moveTop, jellyBoxObj.jellydata.moveLeft, jellyBoxObj.jellydata.moveAngle );

		jellyBoxObj.style.height = jellyBoxObj.jellydata.moveHeight + 'px';
		jellyBoxObj.style.width = jellyBoxObj.jellydata.moveWidth + 'px';

		jellyBoxObj.jellydata.isBusy = false;

		if ( jellyBoxObj.jellydata.returntimeout > 0 )
			{
			self.setTimeout( jellyBoxObj.jellydata.returntimeout );
			}
		}


	this.stepGoMove = function()
		{
		var elapsed = new Date().getTime() - jellyBoxObj.jellydata.moveStart;

		var movedPercent = elapsed / jellyBoxObj.jellydata.gospeed; 

		if ( movedPercent >= 1.0 )
			{
			clearInterval( jellyBoxObj.jellydata.moveInterval );
			self.finishedGoMove();
			return;
			}

		jellyBoxObj.jellydata.moveTop = intval(jellyBoxObj.jellydata.saveTop + jellyBoxObj.jellydata.deltatop * movedPercent);
		jellyBoxObj.jellydata.moveLeft = intval(jellyBoxObj.jellydata.saveLeft + jellyBoxObj.jellydata.deltaleft * movedPercent);
		jellyBoxObj.jellydata.moveAngle = intval(jellyBoxObj.jellydata.saveAngle - jellyBoxObj.jellydata.deltaangle * movedPercent);
		jellyBoxObj.jellydata.moveHeight = intval(jellyBoxObj.jellydata.saveHeight + jellyBoxObj.jellydata.deltaheight * movedPercent);
		jellyBoxObj.jellydata.moveWidth = intval(jellyBoxObj.jellydata.saveWidth + jellyBoxObj.jellydata.deltawidth * movedPercent);

		self.setPosition( jellyBoxObj.jellydata.moveTop, jellyBoxObj.jellydata.moveLeft, jellyBoxObj.jellydata.moveAngle );

		jellyBoxObj.style.height = jellyBoxObj.jellydata.moveHeight + 'px';
		jellyBoxObj.style.width = jellyBoxObj.jellydata.moveWidth + 'px';
		}


	this.beginGoMove = function( jumpstart )
		{
		self.setNextEventTrigger( jellyBoxObj.jellydata.returncontrol );

		if ( jumpstart )
			{
			var elapsed = new Date().getTime() - jellyBoxObj.jellydata.moveStart;
			var movedPercent = elapsed / jellyBoxObj.jellydata.returnspeed; 
			jellyBoxObj.jellydata.moveStart = new Date().getTime() - (jellyBoxObj.jellydata.gospeed * (1.0 - movedPercent));
			}
		else
			{
			jellyBoxObj.jellydata.moveStart = new Date().getTime();
			jellyBoxObj.jellydata.moveTop = jellyBoxObj.jellydata.top;
			jellyBoxObj.jellydata.moveLeft = jellyBoxObj.jellydata.left;
			jellyBoxObj.jellydata.moveHeight = jellyBoxObj.jellydata.height;
			jellyBoxObj.jellydata.moveWidth = jellyBoxObj.jellydata.width;
			jellyBoxObj.jellydata.moveAngle = jellyBoxObj.jellydata.angle;
			}

		jellyBoxObj.jellydata.layerController.push();

		jellyBoxObj.jellydata.moveInterval = setInterval( self.stepGoMove, 10 );
		}


	this.clicked = function()
		{
		// If a child object within this object is clicked then don't trigger the animation events
		//
		if ( typeof window != 'undefined' )
			if ( typeof window.event != 'undefined' )
				if ( window.event != null )
					window.event.cancelBubble = true;

		// Check if it's a move interupted
		//
		var jumpstart = false;

		if ( jellyBoxObj.jellydata.isBusy )
			{
			clearInterval( jellyBoxObj.jellydata.moveInterval );
			jumpstart = true;
			}

		jellyBoxObj.jellydata.isBusy = true;

		self.clearTimeout();

		toggle = !toggle;

		if ( toggle )
			self.beginGoMove(jumpstart);
		else
			self.beginReturnMove(jumpstart);

		return self;
		}


	this.setNextEventTrigger = function( control )
		{
		// Call a user defined function when the stage changes
		//
		if ( jellyBoxObj.jellydata.ontoggle.length > 0 )
			if ( typeof window != 'undefined' )
				if ( typeof window[jellyBoxObj.jellydata.ontoggle] == 'function' )
					window[jellyBoxObj.jellydata.ontoggle]( toggle );


		if ( control=='onmouseover')
			{
			jellyBoxObj.jellydata.controlObj.onmouseover = jellyBoxObj.jellydata.controlObj.onclickController.click;
			jellyBoxObj.jellydata.controlObj.onclick = jellyBoxObj.jellydata.controlObj.onclickController.click;
			jellyBoxObj.jellydata.controlObj.onmouseout = null;
			}
		else
		if ( control=='onmouseout')
			{
			jellyBoxObj.jellydata.controlObj.onmouseover = null;
			jellyBoxObj.jellydata.controlObj.onclick = null;
			jellyBoxObj.jellydata.controlObj.onmouseout = jellyBoxObj.jellydata.controlObj.onclickController.click;
			}
		else
		if ( control=='onclick')
			{
			jellyBoxObj.jellydata.controlObj.onmouseover = null;
			jellyBoxObj.jellydata.controlObj.onclick = jellyBoxObj.jellydata.controlObj.onclickController.click;
			jellyBoxObj.jellydata.controlObj.onmouseout = null;
			}
		else
		if ( control=='clock')
			{
			jellyBoxObj.jellydata.controlObj.onmouseover = null;
			jellyBoxObj.jellydata.controlObj.onclick = null;
			jellyBoxObj.jellydata.controlObj.onmouseout = null;
			}
		else
			{	// default to onclick
			jellyBoxObj.jellydata.controlObj.onmouseover = null;
			jellyBoxObj.jellydata.controlObj.onclick = jellyBoxObj.jellydata.controlObj.onclickController.click;
			jellyBoxObj.jellydata.controlObj.onmouseout = null;
			}

		return self;
		}



	this.initStageTwo = function()
		{
		if ( jellyBoxObj.jellydata.controlResolved )
			return;

		jellyBoxObj.jellydata.controlObj = document.getElementById(jellyBoxObj.jellydata.target);

		if ( jellyBoxObj.jellydata.controlObj == null )
			jellyBoxObj.jellydata.controlObj = jellyBoxObj;

		jellyBoxObj.jellydata.controlResolved = true;

		if ( jellyBoxObj.jellydata.controlObj.onclickController == null )
			jellyBoxObj.jellydata.controlObj.onclickController = new JellyBoxClickController();

		jellyBoxObj.jellydata.controlObj.onclickController.add( self.click );

		if ( jellyBoxObj.jellydata.control.length > 0 )
			{
			if ( jellyBoxObj.jellydata.gocontrol.length == 0 )
				jellyBoxObj.jellydata.gocontrol = jellyBoxObj.jellydata.control;

			if ( jellyBoxObj.jellydata.returncontrol.length == 0 )
				jellyBoxObj.jellydata.returncontrol = jellyBoxObj.jellydata.control;
			}

		self.setNextEventTrigger( jellyBoxObj.jellydata.gocontrol );

		// if we're starting out with an angle assigned
		//
		if ( jellyBoxObj.jellydata.saveAngle != 0 )
			self.setPosition( jellyBoxObj.jellydata.saveTop, jellyBoxObj.jellydata.saveLeft, jellyBoxObj.jellydata.saveAngle );

		if ( jellyBoxObj.jellydata.interval > 0 )
			self.setInterval( jellyBoxObj.jellydata.interval );
		else
		if ( jellyBoxObj.jellydata.autostartdelay > 0 )
			self.setTimeout( jellyBoxObj.jellydata.autostartdelay );
		else
		if ( jellyBoxObj.jellydata.gotimeout > 0 )
			self.setTimeout( jellyBoxObj.jellydata.gotimeout );
		}



	this.init = function( newJellyBoxObj )
		{
		// Queue Items for Stage II init
		//
		if ( JellyBoxSaveOnLoadEvent == null )
			if ( window.onload != null )
				if ( window.onload != JellyBoxLoadController )
					JellyBoxSaveOnLoadEvent = window.onload;
		window.onload = JellyBoxLoadController;

		// Stage I init of each JellyObject
		//
		jellyBoxObj = newJellyBoxObj;

		// Layer Management
		//
		jellyBoxObj.jellydata.layerController = new JellyBoxLayerController( jellyBoxObj );

		jellyBoxObj.jellydata.isBusy = false;
		jellyBoxObj.jellydata.controlResolved = false;
		jellyBoxObj.jellydata.ieImagesFiltered = false;

		jellyBoxObj.jellydata.top = 0;
		jellyBoxObj.jellydata.left = 0;

		jellyBoxObj.jellydata.saveTop = jellyBoxObj.jellydata.top;
		jellyBoxObj.jellydata.saveLeft = jellyBoxObj.jellydata.left;
		jellyBoxObj.jellydata.saveHeight = jellyBoxObj.jellydata.height;
		jellyBoxObj.jellydata.saveWidth = jellyBoxObj.jellydata.width;
		jellyBoxObj.jellydata.saveAngle = jellyBoxObj.jellydata.angle;

		JellyBoxPendingStageTwo.push(self);

		return self;
		}


	return self;
	}
