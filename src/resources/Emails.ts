/* eslint-disable max-len */
import { Platform } from 'react-native'
import Config from 'react-native-config'
import { getBuildNumber, getVersion } from 'react-native-device-info'


export const Emails = {
  CONTACT_US: {
    email: Config.CONTACT_US_EMAIL,
    subject: 'Contact Podverse',
    body: `If you are reporting an issue, please provide your device type and/or brand and steps to reproduce the bug if possible. Thank you! / Platform: ${Platform.OS} / Version: ${getVersion()} build ${getBuildNumber()}`
  },
  CHECKOUT_ISSUE: {
    email: Config.SUPPORT_EMAIL,
    subject: 'Podverse Checkout Issue',
    body: `Please explain your issue below and we'll get back to you as soon as we can. / Platform: ${Platform.OS} / Version: ${getVersion()} build ${getBuildNumber()}`
  },
  REQUEST_PODCAST: {
    email: Config.CURATOR_EMAIL,
    subject: 'Podverse - Request Podcast',
    body:
      'Please provide the title of the podcast. ' + 
      'If there are multiple podcasts with the same title, ' +
      'please provide the name of the host or a link to the podcast you are looking for.'
  },
}
