#!/usr/bin/env node
/**
 * Adds missing i18n keys used in Vue/TS to en.json and da.json.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, '../src/locales')

function set(obj, keyPath, value) {
  const parts = keyPath.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {}
    cur = cur[p]
  }
  if (cur[parts.at(-1)] === undefined) {
    cur[parts.at(-1)] = value
    return true
  }
  return false
}

const patches = {
  en: {
    'admin.views.dashboard.thirtyDaysAgo': '30 days ago',
    'admin.views.plans.failedLoadPlans': 'Failed to load plans',
    'admin.views.plans.planDetails': 'Plan Details',
    'admin.views.plans.planDetailsSubtitle': 'View and manage plan information',
    'admin.views.plans.failedCreateSubscription': 'Failed to create subscription',
    'admin.views.seo.failedLoadPages': 'Failed to load pages',
    'admin.views.seo.failedLoadPage': 'Failed to load page',
    'admin.views.seo.failedDelete': 'Failed to delete page',
    'common.system': 'System',
    'common.errors.failedSaveLocation': 'Failed to save location',
    'common.errors.failedDeleteLocation': 'Failed to delete location',
    'dealer.views.leads.failedAssignLead': 'Failed to assign lead',
    'dealer.views.leads.failedLoadLead': 'Failed to load lead',
    'dealer.views.leads.failedSendMessage': 'Failed to send message',
    'dealer.views.leads.failedUpdateCategory': 'Failed to update category',
    'dealer.views.leads.failedUpdateIntent': 'Failed to update intent',
    'dealer.views.enquiries.callCustomer': 'Call Customer',
    'dealer.views.subscription.title': 'Subscription',
    'dealer.views.subscription.subtitle': 'View and manage your subscription plan',
    'dealer.views.vehicleDetail.fuelType': 'Fuel Type',
    'dealer.views.vehicleDetail.failedUpdateVehicle': 'Failed to update vehicle',
  },
  da: {
    'admin.views.dashboard.thirtyDaysAgo': '30 dage siden',
    'admin.views.plans.failedLoadPlans': 'Kunne ikke indlæse planer',
    'admin.views.plans.planDetails': 'Plandetaljer',
    'admin.views.plans.planDetailsSubtitle': 'Se og administrer planoplysninger',
    'admin.views.plans.failedCreateSubscription': 'Kunne ikke oprette abonnement',
    'admin.views.seo.failedLoadPages': 'Kunne ikke indlæse sider',
    'admin.views.seo.failedLoadPage': 'Kunne ikke indlæse side',
    'admin.views.seo.failedDelete': 'Kunne ikke slette side',
    'admin.views.dealers.title': 'Forhandlere',
    'admin.views.dealers.subtitle': 'Administrer forhandlerkonti, personale og abonnementer',
    'admin.views.dealers.vehicles': 'Køretøjer',
    'admin.views.dealers.staff': 'Personale',
    'admin.views.dealers.subscriptions': 'Abonnementer',
    'common.system': 'System',
    'common.errors.failedSaveLocation': 'Kunne ikke gemme lokation',
    'common.errors.failedDeleteLocation': 'Kunne ikke slette lokation',
    'dealer.views.leads.failedAssignLead': 'Kunne ikke tildele lead',
    'dealer.views.leads.failedLoadLead': 'Kunne ikke indlæse lead',
    'dealer.views.leads.failedSendMessage': 'Kunne ikke sende besked',
    'dealer.views.leads.failedUpdateCategory': 'Kunne ikke opdatere kategori',
    'dealer.views.leads.failedUpdateIntent': 'Kunne ikke opdatere hensigt',
    'dealer.views.enquiries.callCustomer': 'Ring til kunde',
    'dealer.views.subscription.title': 'Abonnement',
    'dealer.views.subscription.subtitle': 'Se og administrer dit abonnement',
    'dealer.views.vehicleDetail.fuelType': 'Brændstoftype',
    'dealer.views.leadsDetail.crm.title': 'CRM',
    'dealer.views.leadsDetail.crm.timeline': 'Tidslinje',
    'dealer.views.leadsDetail.crm.notes': 'Noter',
    'dealer.views.leadsDetail.crm.tasks': 'Opgaver',
    'dealer.views.leadsDetail.crm.addNote': 'Tilføj en note',
    'dealer.views.leadsDetail.crm.taskTitle': 'Opgavetitel',
    'dealer.views.leadsDetail.crm.dueDate': 'Forfaldsdato',
  },
}

for (const locale of ['en', 'da']) {
  const file = path.join(localesDir, `${locale}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  let added = 0
  for (const [key, value] of Object.entries(patches[locale])) {
    if (set(data, key, value)) {
      added++
      console.log(`[${locale}] + ${key}`)
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`[${locale}] added ${added} keys\n`)
}
