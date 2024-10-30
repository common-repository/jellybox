<?php
require_once( ABSPATH . WPINC . '/shortcodes.php' );

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


$jellyboxCSSandJSincluded = false;



function install_blank_jellybox_css()
	{
	$filename = plugin_dir_path(__FILE__) . '/css/jellybox.css';

	// check if the file already exists
	//
	if ( !(($handle = fopen($filename, "r")) === false) )
		{
		fclose($handle);
		return;
		}

	$crlf = chr(13).chr(10);
	$text = '';
	$text = $text . chr(47) . chr(42) . $crlf;
	$text = $text . '* Plugin Name: jellybox' . $crlf;
	$text = $text . '* Plugin URI: http://www.jellyrobotics.com/' . $crlf;
	$text = $text . '* Description: Tilted and/or Animated Text, Images and Boxes' . $crlf;
	$text = $text . '* Author: John Carter (not from Mars)' . $crlf;
	$text = $text . '* Author URI: http://www.jellyrobotics.com' . $crlf;
	$text = $text . '*' . $crlf;
	$text = $text . '*' . $crlf;
	$text = $text . '* CUSTOMIZE YOUR jellybox CSS IN THIS FILE' . $crlf;
	$text = $text . '* =======================================================' . $crlf;
	$text = $text . '* You can safely add your custom css modifications below.' . $crlf;
	$text = $text . '* This file will not be overwritten by plug-in updates.' . $crlf;
	$text = $text . '*' . $crlf;
	$text = $text . '*' . $crlf;
	$text = $text . chr(42) . chr(47) . $crlf;
	$text = $text . $crlf;

	// Create the blank css file
	//
	if ( !(($handle = fopen($filename, "w")) === false) )
		{
		fwrite($handle, $text);
		fclose($handle);
		}
	}



function jellybox_handler( $atts, $content=null )
	{
	global $jellyboxCSSandJSincluded;	// keep track of things we only want to do once per page load

	$jellybox_output = '';

	// This is only needed once per page
	//
	if ( $jellyboxCSSandJSincluded === false )
		{
		$jellyboxCSSandJSincluded = true;
		$jellybox_output .= '<script type="text/javascript" src="'.plugins_url() . '/jellybox/js/jellybox.js"></script>';
		$jellybox_output .= '<link rel="stylesheet" type="text/css" href="'.plugins_url() . '/jellybox/template/jellybox.css"></link>';
		$jellybox_output .= '<link rel="stylesheet" type="text/css" href="'.plugins_url() . '/jellybox/css/jellybox.css"></link>';
		}


	// This is needed once per instance of the shortcode
	//
	$elementid = "ID".uniqid();
	$defaultclass = "CLASS".uniqid();


	// allow user to assign the element ID
	//
	if ( array_key_exists( "id", $atts ) )
		{
		$elementid = $atts["id"];
		}


	// allow user to assign the class Name
	//
	if ( array_key_exists( "class", $atts ) )
		{
		$defaultclass = $atts["class"];
		}


	$defatts = array(
		'height' => '30',
		'width' => '100',
		'angle' => '0',
		'gospeed' => '0',
		'returnspeed' => '0',
		'control' => 'onclick',		// used to define whether events are triggered by onclick or mouseover or timeout
		'gocontrol' => '',			// used to define whether events are triggered by onclick or mouseover or timeout
		'returncontrol' => '',		// used to define whether events are triggered by onclick or mouseover or timeout
		'target' => $elementid,		// used to define the elementid on the page for onclick or mouseover events that trigger animation
		'gotimeout' => '0',
		'returntimeout' => '0',
		'deltatop' => '0',
		'deltaleft' => '0',
		'deltaheight' => '0',
		'deltawidth' => '0',
		'deltaangle' => '0',
		'autostartdelay' => '0',
		'shadow' => 'no',
		'ontoggle' => '',
		'interval' => '0',
		'inline' => '',
		'cstyle' => '',
		'style' => '',
		'class' => $defaultclass);		// used to allow custom class configuration and custom classContainer configuration

	extract( shortcode_atts($defatts, $atts) );

	$jellydata = json_encode( array(
		'elementid' => $elementid,
		'control' => $control,
		'gocontrol' => $gocontrol,
		'returncontrol' => $returncontrol,
		'ontoggle' => $ontoggle,
		'target' => $target,
		'height' => intval($height),
		'width' => intval($width),
		'angle' => intval($angle),
		'gospeed' => intval($gospeed),
		'returnspeed' => intval($returnspeed),
		'deltatop' => intval($deltatop),
		'deltaleft' => intval($deltaleft),
		'deltaheight' => intval($deltaheight),
		'deltawidth' => intval($deltawidth),
		'deltaangle' => intval($deltaangle),
		'autostartdelay' => intval($autostartdelay),
		'gotimeout' => intval($gotimeout),
		'returntimeout' => intval($returntimeout),
		'interval' => intval($interval)
	));



	// Manage optional wrappers DIV or SPAN
	//
	$wraptag = "div";

	if ( strcasecmp( $inline, "yes" ) == 0 )
		{
		$wraptag = "span";
		$cstyle = 'display:inline-block; vertical-align:top;' . trim($cstyle);
		$style = 'display:inline-block; vertical-align:top;' . trim($style);
		}


	// Fix the custom styles
	//
	$cstyle = trim($cstyle);
	if ( !empty($cstyle) )
		$cstyle = ' ' . $cstyle;

	$style = trim($style);
	if ( !empty($style) )
		$style = ' ' . $style;


	// Create the container
	//
	$jellybox_output .= '<' . $wraptag . ' id="' .$elementid. 'Container" class="' .$class. 'Container" style="height:' .$height. 'px; width:' .$width. 'px; z-index: 99998;' . $cstyle . '">';


	
	// Create the JellDiv and it's content
	//
	$jellybox_output .= '<' . $wraptag . ' id="' .$elementid. '" class="' .$class.'" style="height:' . $height . 'px; width:' . $width . 'px; position: relative; z-index: 99999; overflow: hidden;' . $style . '">';


	// Output the content
	//
	$jellybox_output .= do_shortcode( $content );


	// Close the DIV's
	//
	$jellybox_output .= '</' . $wraptag . '>';
	$jellybox_output .= '</' . $wraptag . '>';


	// Execute the javascript
	//
	$jellybox_output .= '<script type="text/javascript">';
	$jellybox_output .= 'document.getElementById("'.$elementid . '").jellydata = ' . $jellydata . ';';
	$jellybox_output .= 'document.getElementById("'.$elementid . '").jellyboxcontroller = new JellyBoxController().init(document.getElementById("'.$elementid . '"));';
	$jellybox_output .= '</script>';


	return $jellybox_output;
	}




// Register the activation/setup function
//
register_activation_hook( __FILE__, 'install_blank_jellybox_css' );



// Register the shortcode with WordPress
//
add_shortcode("jellybox",  "jellybox_handler");
add_shortcode("jellybox0", "jellybox_handler");
add_shortcode("jellybox1", "jellybox_handler");
add_shortcode("jellybox2", "jellybox_handler");
add_shortcode("jellybox3", "jellybox_handler");
add_shortcode("jellybox4", "jellybox_handler");

?>