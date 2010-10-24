Export.HCard = {
  
  /**
   * Will send a hCard to Google
   * For now it is quite hard to do, but I'm JSON will be supported one day
   * A typical XML structure for adding a contact to Google is:
   * <atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:gd='http://schemas.google.com/g/2005'>
   *   <atom:category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/contact/2008#contact' />
   *   <gd:name>
   *     <gd:givenName>Elizabeth</gd:givenName>
   *     <gd:familyName>Bennet</gd:familyName>
   *     <gd:fullName>Elizabeth Bennet</gd:fullName>
   *   </gd:name>
   *   <atom:content type='text'>Notes</atom:content>
   *   <gd:email rel='http://schemas.google.com/g/2005#work' primary='true' address='liz@gmail.com' displayName='E. Bennet' />
   *   <gd:email rel='http://schemas.google.com/g/2005#home' address='liz@example.org' />
   *   <gd:phoneNumber rel='http://schemas.google.com/g/2005#work' primary='true'>(206)555-1212</gd:phoneNumber>
   *   <gd:phoneNumber rel='http://schemas.google.com/g/2005#home'>(206)555-1213</gd:phoneNumber>
   *   <gd:structuredPostalAddress rel='http://schemas.google.com/g/2005#work' primary='true'>
   *     <gd:city>Mountain View</gd:city>
   *     <gd:street>1600 Amphitheatre Pkwy</gd:street>
   *     <gd:region>CA</gd:region>
   *     <gd:postcode>94043</gd:postcode>
   *     <gd:country>United States</gd:country>
   *   </gd:structuredPostalAddress>
   * </atom:entry>
   */
  google: function( card, callback ){
    if( !card.fn ){
      throw new Error( 'hCard must have a name' );
    }
    
    // Make sure the user is logged in 
    if( !oauth.hasToken() ){
      throw new Error( 'You must be logged in' );
    }
    
    // Create the XML document to send to Google
    var stdXML = "<atom:entry xmlns:atom='http://www.w3.org/2005/Atom' xmlns:gd='http://schemas.google.com/g/2005'>"
                 + "<atom:category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/contact/2008#contact' />"
               + "</atom:entry>";
    var sendTo = 'https://www.google.com/m8/feeds/contacts/default/full';
    var parser = new DOMParser();
    
    // var xml can be used as a DOM document
    var xml = parser.parseFromString(stdXML, "text/xml");
    var root = xml.firstChild;
    
    // Add name
    var elName = xml.createElement( 'gd:name' );
    var elFullName = xml.createElement( 'gd:fullName' );
    
    elName.appendChild( elFullName );
    elFullName.appendChild( xml.createTextNode( card.fn ) );
    
    root.appendChild( elName );
    
    // Add email
    if( card.email && card.email.length > 0 ){
      
      // Add all email addresses
      for(var i=0; i<card.email.length; i++){
        var elEmail = xml.createElement( 'gd:email' );
        
        // Set address and address type (home|work)
        elEmail.setAttribute( 'address', card.email[i] );
        
        // Set address type to WORK
        elEmail.setAttribute( 'rel', 'http://schemas.google.com/g/2005#work' );
        
        // Set card.fn as display name for this address
        elEmail.setAttribute( 'displayName', card.fn );
        
        // Append it to the XML doc
        root.appendChild( elEmail );
      }
    }
    
    // Add phone info
    if( card.tel && card.tel.length > 0 ){
      for( var i=0; i<card.tel.length; i++ ){
        var phone = xml.createElement( 'gd:phoneNumber' );
        
        // Set number type to WORK
        phone.setAttribute( 'rel', 'http://schemas.google.com/g/2005#work' );
        
        // Add number as text node
        phone.appendChild( xml.createTextNode( card.tel[i] ) );
        
        // Append it to the XML doc
        root.appendChild( phone );
      }
    }
    
    // Add address info
    if( card.adr && card.adr.length > 0 ){
      
      // Loop over each address
      for( var i=0; i<card.adr.length; i++ ){
        
        // Create a wrapper: structuredPostalAddress
        var address = xml.createElement( 'gd:structuredPostalAddress' );
        
        // Set address type to WORK
        address.setAttribute( 'rel', 'http://schemas.google.com/g/2005#work' );
        
        // Set street address, city, region, postal code and country name if defined
        if( card.adr[i]['street-address'] ){
          var elStreet = xml.createElement( 'gd:street' );
          elStreet.appendChild( xml.createTextNode( card.adr[i]['street-address'] ) );
          address.appendChild( elStreet );
        }
        
        if( card.adr[i].locality ){
          var elCity = xml.createElement( 'gd:city' );
          elCity.appendChild( xml.createTextNode( card.adr[i].locality ) );
          address.appendChild( elCity );
        }
        
        if( card.adr[i].region ){
          var elRegion = xml.createElement( 'gd:region' );
          elRegion.appendChild( xml.createTextNode( card.adr[i].region ) );
          address.appendChild( elRegion );
        }
        
        if( card.adr[i]['postal-code'] ){
          var elPostcode = xml.createElement( 'gd:postcode' );
          elPostcode.appendChild( xml.createTextNode( card.adr[i]['postal-code'] ) );
          address.appendChild( elPostcode );
        }
        
        if( card.adr[i]['country-name'] ){
          var elCountry = xml.createElement( 'gd:country' );
          elCountry.appendChild( xml.createTextNode( card.adr[i]['country-name'] ) );
          address.appendChild( elCountry );
        }
        
        // Append each address to the XML doc
        root.appendChild( address );
      }      
    }
    
    // Now that we have a complete XML structure, 
    // we can finally POST it (serialized) to Google
    var Serializer = new XMLSerializer();
    
    oauth.sendSignedRequest(sendTo, callback, {
      'method': 'POST',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'application/atom+xml',
      },
      'parameters': {'alt': 'json'},
      'body': Serializer.serializeToString( xml )
    });
  }
};