import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'
import { Divider, Text } from '.'
import { PV } from '../resources'

type Props = {
  containerStyles?: any
  title?: string
}

export const TableSectionHeader = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { containerStyles, title } = props

  return (
    <View style={containerStyles}>
      <Divider />
      <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <Text style={[styles.tableSectionHeaderText, globalTheme.tableSectionHeaderText]}>
          {title}
        </Text>
      </View>
      <Divider />
    </View>
  )
}

const styles = {
  tableSectionHeader: {
    height: PV.Table.sectionHeader.height,
    paddingLeft: 8,
    paddingRight: 8
  },
  tableSectionHeaderText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Table.sectionHeader.height,
    paddingRight: 8
  }
}
