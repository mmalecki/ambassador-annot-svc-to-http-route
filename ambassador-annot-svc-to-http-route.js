'use strict'
const yaml = require('js-yaml')

module.exports = function (svc, parentRefs) {
  if (!svc.kind === 'Service') throw new TypeError(`Expected \`kind: Service\`, received \`kind: ${svc.kind}\``)
  const annot = svc?.metadata?.annotations?.['getambassador.io/config']
  if (!annot) return null

  const mapping = yaml.loadAll(annot)[0]

  if (mapping.kind !== 'Mapping') return null

  return {
    apiVersion: 'gateway.networking.k8s.io/v1alpha2',
    kind: 'HTTPRoute',
    metadata: {
      namespace: svc.metadata.namespace,
    },
    spec: {
      parentRefs: parentRefs,
      rules: [
        {
          backendRefs: [
            {
              kind: 'Service',
              name: svc.metadata.name,
              port: svc.spec.ports[0].port
            }
          ],
          matches: [
            {
              path: {
                type: 'PathPrefix',
                value: mapping.prefix
              }
            }
          ]
        }
      ]
    }
  }
}
