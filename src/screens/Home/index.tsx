import { useState } from 'react';
import { Image, ScrollView, Text, View, Alert } from 'react-native';

import { styles } from './styles';

import { Tip } from '../../components/Tip';
import { Item, ItemProps } from '../../components/Item';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

import * as ImgePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { api } from '../../service/api';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItem] = useState<ItemProps[]>([]);
  const [message, setMessage] = useState('');


  async function handleSelectImage() {
    try {

      const {status} = await ImgePicker.requestMediaLibraryPermissionsAsync();
      
      if(status !== ImgePicker.PermissionStatus.GRANTED){
        return Alert.alert("É necessario conceder permissão para acessar sua galeria!")
      }

      setIsLoading(true);

      const response = await ImgePicker.launchImageLibraryAsync({
        mediaTypes: ImgePicker.MediaTypeOptions.Images,
        allowsEditing:true,
        aspect:[4,4],
        quality:1
      })

      if(response.canceled)
      return setIsLoading(false)

      if(!response.canceled){
      const imgManipuled = await ImageManipulator.manipulateAsync(
        response.assets[0].uri,
        [{resize:{width:900}}],
        {
          compress:1,
          format:ImageManipulator.SaveFormat.JPEG,
          base64:true
        }
      );
      setSelectedImageUri(imgManipuled.uri)
      foodDetect(imgManipuled.base64)
    }
     
    } catch (error) {
      console.log(error)
    }
  }   

  async function foodDetect(imageBase64:string | undefined) {
    const response = await api.post(`/v2/models/${process.env.EXPO_PUBLIC_API_MODEL_ID}/versions/${process.env.EXPO_PUBLIC_API_MODEL_VERSION_ID}/outputs`,{
      "user_app_id":{
        "user_id":process.env.EXPO_PUBLIC_API_USER_ID,
        "app_id":process.env.EXPO_PUBLIC_API_APP_ID
      },
      "inputs":[
        {
          "data":{
            "image":{
              "url":"https://github.com/vandodev.png"
            }
          }
        }
      ]
    });

    // console.log(response.data.outputs[0].data);

    const concept = response.data.outputs[0].data.concepts.map((concept:any)=>{
      return {
        name: concept.name,
        percentage: `${concept.value * 100} %`
      }
    })
    setItem(concept);
    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectImage} disabled={isLoading} />

      {
        selectedImageUri ?
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          :
          <Text style={styles.description}>
            Selecione a foto do seu prato para analizar.
          </Text>
      }

      <View style={styles.bottom}>
      {
          isLoading ? <Loading/> : 
          <>
            <Tip message="Aqui vai uma dica" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
              <View style={styles.items}>
                {
                  items.map((item)=>(
                    <Item key={item.name} data={item} />
                  ))
                }
              </View>
            </ScrollView>
          </>
        }
      </View>
    </View>
  );
}