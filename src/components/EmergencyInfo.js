import React from 'react';

const EmergencyInfo = () => {
  const emergencyContacts = [
    { name: 'Police', number: '100', icon: 'fas fa-shield-alt' },
    { name: 'Fire Department', number: '101', icon: 'fas fa-fire' },
    { name: 'Ambulance', number: '102', icon: 'fas fa-ambulance' },
    { name: 'Disaster Management', number: '108', icon: 'fas fa-life-ring' },
    { name: 'Women Helpline', number: '1091', icon: 'fas fa-female' },
    { name: 'Child Helpline', number: '1098', icon: 'fas fa-child' }
  ];

  const emergencyTips = [
    {
      title: 'Earthquake',
      tips: [
        'Drop, Cover, and Hold On',
        'Stay away from windows and heavy objects',
        'If outdoors, move to an open area'
      ]
    },
    {
      title: 'Flood',
      tips: [
        'Move to higher ground immediately',
        'Avoid walking through moving water',
        'Do not drive in flooded areas'
      ]
    },
    {
      title: 'Fire',
      tips: [
        'Stop, Drop, and Roll if clothes catch fire',
        'Crawl low in smoke',
        'Feel doors before opening - if hot, use another exit'
      ]
    },
    {
      title: 'Medical Emergency',
      tips: [
        'Check ABC (Airway, Breathing, Circulation)',
        'Call emergency services immediately',
        'Do not move seriously injured persons unless necessary'
      ]
    }
  ];

  return (
    <div className="emergency-info">
      <div className="card">
        <div className="card-header">
          <h3 className="mb-0">
            <i className="fas fa-first-aid" style={{ color: 'var(--danger)', marginRight: '10px' }}></i>
            Emergency Information
          </h3>
        </div>
        
        <div className="card-body">
          {/* Emergency Contacts */}
          <div className="emergency-contacts">
            <h4>Emergency Contacts</h4>
            <div className="contacts-grid">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-icon">
                    <i className={contact.icon}></i>
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-number">{contact.number}</div>
                  </div>
                  <a href={`tel:${contact.number}`} className="contact-call">
                    <i className="fas fa-phone"></i>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Tips */}
          <div className="emergency-tips">
            <h4>Emergency Preparedness Tips</h4>
            <div className="tips-grid">
              {emergencyTips.map((category, index) => (
                <div key={index} className="tip-category">
                  <h5>{category.title}</h5>
                  <ul>
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Kit Checklist */}
          <div className="emergency-kit">
            <h4>Emergency Kit Checklist</h4>
            <div className="kit-items">
              {[
                'Water (1 gallon per person per day)',
                'Non-perishable food (3-day supply)',
                'First aid kit',
                'Flashlight with extra batteries',
                'Whistle to signal for help',
                'Dust masks',
                'Moist towelettes and garbage bags',
                'Wrench or pliers to turn off utilities',
                'Manual can opener',
                'Local maps',
                'Cell phone with chargers',
                'Prescription medications',
                'Important documents in waterproof container'
              ].map((item, index) => (
                <div key={index} className="kit-item">
                  <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginRight: '8px' }}></i>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyInfo;