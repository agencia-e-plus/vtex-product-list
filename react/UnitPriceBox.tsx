import React from 'react'
import { FormattedCurrency } from 'vtex.format-currency'
import { useCssHandles } from 'vtex.css-handles'
import { IOMessageWithMarkers } from 'vtex.native-types'
import { useQuery } from 'react-apollo'
import { Loading } from 'vtex.render-runtime'

import GET_SPECIFICATIONS_QUERY from './queries/GetSpecifications.gql'
import { useItemContext } from './ItemContext'

type GetSpecificationData = {
  product: {
    specificationGroups: Array<{
      name: string
      specifications: Array<{
        name: string
        values: string[]
      }>
    }>

    items: Array<{
      itemId: string
      sellers: Array<{
        commertialOffer: {
          ListPrice: number
          Price: number
        }
      }>
    }>
  }
}

type GetSpecificationVariables = {
  skuId: any
}

interface UnitPriceBoxProps {
  message: string
  markers?: []
  basePrice: 'price' | 'sellingPrice' | 'listPrice'
}

const allowPackagingType = ['Caixa']

const CSS_HANDLES = ['container-unit-price-box'] as const

const UnitPriceBox: React.FC<UnitPriceBoxProps> = ({
  message = 'Preço unitário: {price}',
  markers = [],
}) => {
  const { item, loading: loadingItemContext } = useItemContext()
  const handles = useCssHandles(CSS_HANDLES)

  const { loading: loadingQuery, data } = useQuery<
    GetSpecificationData,
    GetSpecificationVariables
  >(GET_SPECIFICATIONS_QUERY, {
    variables: { skuId: item.id },
  })

  const priceCommertialOffer = data?.product.items.find(
    (i: any) => i.itemId === item.id
  )?.sellers[0].commertialOffer.Price

  const packagingType = item.skuSpecifications?.find(
    (sku: any) => sku?.fieldName === 'Embalagem'
  )?.fieldValues[0]

  const isContainsValidPackaging = allowPackagingType.includes(packagingType!)

  if (!isContainsValidPackaging) return null

  if (loadingItemContext || loadingQuery) {
    return <Loading />
  }

  const quantityItensBox = data?.product.specificationGroups
    .find((group: any) => group.name === 'Embalagem')
    ?.specifications.find(
      (specification: any) => specification.name === 'QtdUndEmbFech'
    )

  if (!quantityItensBox) return null

  const quantityItens = Number(quantityItensBox.values[0])

  const unitPriceBox = priceCommertialOffer / quantityItens

  return (
    <div className={handles['container-unit-price-box']}>
      <IOMessageWithMarkers
        markers={markers}
        handleBase="quantity-outside"
        message={message}
        values={{
          price: <FormattedCurrency value={unitPriceBox} />,
        }}
      />
    </div>
  )
}

UnitPriceBox.schema = {
  properties: {},
}

export default UnitPriceBox
