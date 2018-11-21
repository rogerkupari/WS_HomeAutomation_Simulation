/*
 * AvrRaspi_projekti17.c
 *
 * Created: 28.4.2017 18:18:19
 * Author : Roger Kupari
 */ 
 
 #define F_CPU 1000000UL 

#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdio.h>
#include <stdint.h>

#define XTAL 1000000
#define BAUD 9600 // nopeus = 9600baud



void keittio(void);
void makuuhuone(void);
void kuisti(void);

void USART_Init(void);
void USART_Tx(uint8_t data);



int keittioLippu = 0;
int makuuhuoneLippu = 0;
int kuistiLippu = 0;

/*

	PORTC |= 1<<5; // 5-bit = keittioLed (mysql id: 1)
	PORTC |= 1<<3; // 3-bit = makuuhuoneLed (mysql id: 2)
	PORTC |= 1<<2; // 2-bit = kuistiLed (mysql id: 3)
	-------------------------------------------------------------------

	hexat:


	.........keittio.................
	01 = keittio pois ohjattuna (rx)
		AA = pois ohjaus ok. (tx)
	02 = keittio paalle ohjattuna (rx)
		AA = paalle ohjaus ok. (tx)
	E1 = keittio pois painikkeella (tx)
	B1 = keittio paalle painikkeella (tx)



	.........makuuhuone.................
	03 = makuuhuone pois ohjattuna (rx)
		AA = pois ohjaus ok. (tx)
	04 = makuuhuone paalle ohjattuna (rx)
		AA = paalle ohjaus ok. (tx)
	E2 = makuuhuone pois painikkeella (tx)
	B2 = makuuhuone paalle painikkeella (tx)


	.........kuisti.................
	05 = kuisti pois ohjattuna (rx)
		AA = pois ohjaus ok. (tx)
	06 = kuisti paalle ohjattuna (rx)
		AA = paalle ohjaus ok. (tx)
	E3 = kuisti pois painikkeella (tx)
	B3 = kuisti paalle painikkeella (tx)

*/

int main(void)
{
   DDRC |= (1<<5) | (1<<3) | (1<<2); // Datarekisterit ledeille

   // Datarekisterit painikkeille
   DDRD &= ~ (1<<7);
   DDRD &= ~(1<<6);
   DDRB &= ~(1<<0);
   PORTD |= (1<<7) | (1<<6) | (1<<5); // ylösveto painikkeille



	USART_Init();
	sei();
	
	

    while (1) 
    {

		keittio();
		makuuhuone();
		kuisti();
	
    }

	return 0;
}


void keittio(void)
{
		if (bit_is_clear(PIND, 7)) // Painike yhdistää maatasoon
		{
			int suoritus = 0; // Liittyy kärkivärähtelyn poistoon
			
			if(keittioLippu == 1 && suoritus == 0)
			{
				PORTC &= ~ (1<<5); // ledi pois
				USART_Tx(0xA1); // viesti lähetettäväksi
				_delay_ms(400); // kärkivärähtelyn takia viive
				++suoritus; // lisätään suoritus lippuun, jotta suoritus = 1kerta
				keittioLippu = 0; // globaali muuttuja päälle/pois kytkentää varten
			}
			if(keittioLippu == 0 && suoritus == 0)
			{
				PORTC |= (1<<5); // ledi päälle
				USART_Tx(0xB1);
				_delay_ms(400);
				++suoritus;
				keittioLippu = 1;
			}
	
		}

}

void makuuhuone(void)
{
	if (bit_is_clear(PIND, 6))
	{
		int suoritus = 1;

		if(makuuhuoneLippu == 1 && suoritus == 1)
		{
			PORTC &= ~ (1<<3);
			USART_Tx(0xE2);
			_delay_ms(300);
			++suoritus;
			makuuhuoneLippu = 0;
		}
		if(makuuhuoneLippu == 0 && suoritus == 1)
		{
			PORTC |= (1<<3);
			USART_Tx(0xB2);
			_delay_ms(300);
			++suoritus;
			makuuhuoneLippu = 1;
		}
	
	}


}

void kuisti(void)
{
	if (bit_is_clear(PIND, 5))
	{

		int suoritus = 1;

		if(kuistiLippu == 1 && suoritus == 1)
		{
			PORTC &= ~ (1<<2);
			USART_Tx(0xE3);
			_delay_ms(400);
			++suoritus;
			kuistiLippu = 0;
		}
		if(kuistiLippu == 0 && suoritus == 1)
		{
			PORTC |= (1<<2);
			USART_Tx(0xB3);
			_delay_ms(400);
			++suoritus;
			kuistiLippu = 1;
		}
	
	}
}

void USART_Init(void)
{
	UBRR0H = 0x00;
	UBRR0L = ((XTAL/16)/BAUD)-1;
	UCSR0B |= (1<<TXEN0) | (1<<RXEN0); // rx ja tx käyttöön

	UCSR0B |= (1<<RXCIE0); // keskeytys

	UCSR0C |= (1<<UCSZ01) | (1<<UCSZ00); // 8data, 1 stop-bit, parity none
}

void USART_Tx(uint8_t data) // lähetysfunktio
{
	while (!(UCSR0A & (1<<UDRE0))); // kun puskuri on tyhjä
	UDR0 = data; // lisätään lähetys datarekisteriin

}

ISR(USART_RX_vect) // keskeytysfunktio
{
	uint8_t rxData = UDR0; // luetaan saapuva

	switch (rxData) // tulkitaan saapuva
	{
	//keittio
	case 0x1: PORTC &= ~(1<<5); keittioLippu = 0; USART_Tx(0xAA); break; // jos tosi, ledi pois, lippu=0 ja lähetetään ok.
	case 0x2: PORTC |= (1<<5); keittioLippu = 1; USART_Tx(0xAA); break; // jos tosi, ledi päälle, lippu=1 ja lähetetään ok.

	//makuuhuone
	case 0x3: PORTC &= ~(1<<3); makuuhuoneLippu = 0; USART_Tx(0xAA); break;
	case 0x4: PORTC |= (1<<3); makuuhuoneLippu = 1; USART_Tx(0xAA); break;

	//kuisti
	case 0x5: PORTC &= ~(1<<2); kuistiLippu = 0; USART_Tx(0xAA); break;
	case 0x6: PORTC |= (1<<2); kuistiLippu =1; USART_Tx(0xAA); break;

	case 0x11: USART_Tx(0xFF); break; // ping kun saapuva = 11 vastataan FF

	default: USART_Tx(0xA2); // tuntematon ohjaus, vastataan A2

	}
}

