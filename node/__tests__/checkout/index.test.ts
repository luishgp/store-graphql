import { mutations } from '../../resolvers/checkout' 
import orderForm from '../../__mocks__/orderForm'

const mockContext = {
  clients: {
    checkout: {
      orderForm: jest.fn().mockImplementation(() => orderForm),
      updateOrderFormMarketingData: jest.fn(),
      addItem: jest.fn(),
    }
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('should call add item with correct param', async () => {
  const itemToAdd = {
    id: 100,
    quantity: 1,
    seller: '1'
  }
  await mutations.addItem({}, {
    orderFormId: orderForm.orderFormId,
    items: [itemToAdd],
  }, mockContext as any)

  const checkoutClient = mockContext.clients.checkout
  expect(checkoutClient.addItem.mock.calls[0][0]).toBe(orderForm.orderFormId)
  expect(checkoutClient.addItem.mock.calls[0][1]).toMatchObject([itemToAdd])
  expect(checkoutClient.updateOrderFormMarketingData).toBeCalledTimes(0)
})

it('should correctly update order form marketing data when necessary', async () => {
  const itemToAdd = {
    id: 100,
    quantity: 1,
    seller: '1'
  }
  await mutations.addItem({}, {
    orderFormId: orderForm.orderFormId,
    items: [itemToAdd],
    utmParams: { source: 'source', medium: 'medium', campaign: 'campaign' },
    utmiParams: { part: 'part', page: 'page', campaign: 'campaign' },
  }, mockContext as any)
  
  const checkoutClient = mockContext.clients.checkout
  expect(checkoutClient.addItem.mock.calls[0][0]).toBe(orderForm.orderFormId)
  expect(checkoutClient.addItem.mock.calls[0][1]).toMatchObject([itemToAdd])
  expect(checkoutClient.updateOrderFormMarketingData).toBeCalledTimes(1)
  expect(checkoutClient.updateOrderFormMarketingData.mock.calls[0][0]).toBe(orderForm.orderFormId)
  expect(checkoutClient.updateOrderFormMarketingData.mock.calls[0][1]).toMatchObject({
    utmSource: 'source',
    utmMedium: 'medium',
    utmCampaign: 'campaign',
    utmiCampaign: 'campaign',
    utmiPart: 'part',
    utmipage: 'page'
  })
})

it('should not update order form marketing if it is identical to the arg sent', async () => {
  const itemToAdd = {
    id: 100,
    quantity: 1,
    seller: '1'
  }

  const marketingData = {
    utmSource: 'source',
    utmMedium: 'medium',
    utmCampaign: 'campaign',
    utmiCampaign: 'campaign',
    utmiPart: 'part',
    utmipage: 'page'
  }
  const checkoutClient = mockContext.clients.checkout
  checkoutClient.orderForm.mockImplementationOnce(() => ({
    ...orderForm,
    marketingData
  }))

  await mutations.addItem({}, {
    orderFormId: orderForm.orderFormId,
    items: [itemToAdd],
    utmParams: { source: 'source', medium: 'medium', campaign: 'campaign' },
    utmiParams: { part: 'part', page: 'page', campaign: 'campaign' },
  }, mockContext as any)
  
  
  expect(checkoutClient.addItem.mock.calls[0][0]).toBe(orderForm.orderFormId)
  expect(checkoutClient.addItem.mock.calls[0][1]).toMatchObject([itemToAdd])
  expect(checkoutClient.updateOrderFormMarketingData).toBeCalledTimes(0)
})

it('if there is marketing tag in order form but it is different than arg sent, update it', async () => {
  const itemToAdd = {
    id: 100,
    quantity: 1,
    seller: '1'
  }

  const marketingData = {
    utmSource: 'SOURCE DIFFERENT',
    utmMedium: 'medium',
    utmCampaign: 'campaign',
    utmiCampaign: 'campaign',
    utmiPart: 'part',
    utmipage: 'page'
  }
  const checkoutClient = mockContext.clients.checkout
  checkoutClient.orderForm.mockImplementationOnce(() => ({
    ...orderForm,
    marketingData
  }))

  await mutations.addItem({}, {
    orderFormId: orderForm.orderFormId,
    items: [itemToAdd],
    utmParams: { source: 'source', medium: 'medium', campaign: 'campaign' },
    utmiParams: { part: 'part', page: 'page', campaign: 'campaign' },
  }, mockContext as any)
  
  
  expect(checkoutClient.addItem.mock.calls[0][0]).toBe(orderForm.orderFormId)
  expect(checkoutClient.addItem.mock.calls[0][1]).toMatchObject([itemToAdd])
  expect(checkoutClient.updateOrderFormMarketingData).toBeCalledTimes(1)
  expect(checkoutClient.updateOrderFormMarketingData.mock.calls[0][0]).toBe(orderForm.orderFormId)
  expect(checkoutClient.updateOrderFormMarketingData.mock.calls[0][1]).toMatchObject({
    utmSource: 'source',
    utmMedium: 'medium',
    utmCampaign: 'campaign',
    utmiCampaign: 'campaign',
    utmiPart: 'part',
    utmipage: 'page'
  })
})
