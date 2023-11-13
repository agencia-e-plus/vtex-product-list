import React from 'react'
import { FormattedCurrency } from 'vtex.format-currency'
import { FormattedPrice } from 'vtex.formatted-price'
import { Loading } from 'vtex.render-runtime'
import { useCssHandles, applyModifiers } from 'vtex.css-handles'
import { useQuery } from 'react-apollo'

import GET_COMMERTIAL_OFFER_QUERY from './queries/GetCommertialOffer.gql'
import { useItemContext } from './ItemContext'
import { opaque } from './utils/opaque'
import type { TextAlignProp } from './utils/textAlign'
import { parseTextAlign } from './utils/textAlign'
import styles from './styles.css'

const CSS_HANDLES = [
  'productPriceContainer',
  'productPriceCurrency',
  'productPrice',
] as const

type PriceProps = TextAlignProp & {
  showListPrice?: boolean
}

type GetCommertialOfferData = {
  product: {
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

type GetCommertialOfferVariables = {
  skuId: any
}

const Price: React.FC<PriceProps> = ({
  textAlign = 'left',
  showListPrice = true,
}) => {
  const { item, loading: loadingItemContext } = useItemContext()
  const handles = useCssHandles(CSS_HANDLES)

  const { loading: loadingQuery, data } = useQuery<
    GetCommertialOfferData,
    GetCommertialOfferVariables
  >(GET_COMMERTIAL_OFFER_QUERY, {
    variables: { skuId: item.id },
  })

  let priceCommertialOffer = data?.product.items.find(
    (i: any) => i.itemId === item.id
  )?.sellers[0].commertialOffer.Price

  if (loadingItemContext || loadingQuery) {
    return <Loading />
  }

  priceCommertialOffer =
    priceCommertialOffer * (item.unitMultiplier ?? 1) * item.quantity

  const priceByContext =
    item.sellingPrice != null
      ? (item.sellingPrice * item.quantity) / 100
      : priceCommertialOffer

  const newPrice =
    item.listPrice === item.sellingPrice ? priceCommertialOffer : priceByContext

  return (
    <div
      className={`${opaque(item.availability)} ${styles.price} ${
        handles.productPriceContainer
      } ${parseTextAlign(textAlign)}`}
    >
      {item.listPrice && showListPrice && (
        <div
          id={`list-price-${item.id}`}
          className={`${handles.productPriceCurrency}  ${applyModifiers(
            handles.productPriceCurrency,
            item.sellingPrice === 0 ? 'gift' : ''
          )} c-muted-1 strike t-mini mb2`}
        >
          <FormattedCurrency
            value={
              (item.listPrice * (item.unitMultiplier ?? 1) * item.quantity) /
              100
            }
          />
        </div>
      )}
      <div
        id={`price-${item.id}`}
        className={`${handles.productPrice} ${applyModifiers(
          handles.productPrice,
          item.sellingPrice === 0 ? 'gift' : ''
        )} div fw6 fw5-m`}
      >
        <FormattedPrice value={newPrice} />
      </div>
    </div>
  )
}

Price.schema = {
  properties: {
    textAlign: {
      type: 'string',
      default: 'left',
      isLayout: true,
    },
  },
}

export default Price
